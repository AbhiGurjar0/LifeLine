from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio
from fastapi.middleware.cors import CORSMiddleware
import requests, asyncio, os
from dotenv import load_dotenv
import time
from datetime import datetime
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
from websockets.sync.client import connect
import csv
from datetime import datetime
import joblib
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'model'))

# Load model and scaler
from train_signal_model import TrafficLSTM  # ensure class is importable

model = TrafficLSTM()
model.load_state_dict(torch.load("signal_model.pt"))
model.eval()

scaler = joblib.load("signal_scaler.gz")


# predicting density 
def predict_next_density(current_density):
    now = datetime.now()
    features = [[current_density, now.hour, now.weekday()]]
    scaled = scaler.transform(features)
    x = torch.tensor(scaled, dtype=torch.float32)
    pred_scaled = model(x)
    pred = scaler.inverse_transform([[pred_scaled.item(), now.hour, now.weekday()]])[0][0]
    return max(pred, 0)


DATA_FILE = "traffic_history.csv"

# create file with headers if not exists
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "hour", "weekday", "density"])


load_dotenv()
TOMTOM_KEY = os.getenv("TOMTOM_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- GLOBAL SHARED STATE ----
moving_points = []  # 10 vehicles
route_coords = []  # full path
route_chunks = []
chunk_status = []
signal_position = [28.635, 77.210]

clients = set()


# ---- FETCH ROUTE ----
@app.get("/route")
def route(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    global route_coords, moving_points, route_chunks

    url = (
        f"https://api.tomtom.com/routing/1/calculateRoute/"
        f"{start_lat},{start_lon}:{end_lat},{end_lon}/json?traffic=true&maxAlternatives=1&key={TOMTOM_KEY}"
    )

    data = requests.get(url).json()
    points = data["routes"][0]["legs"][0]["points"]
    route_coords = [[p["latitude"], p["longitude"]] for p in points]

    # Create road chunks (≈20 points per chunk)
    chunk_size = 20
    route_chunks = [
        route_coords[i : i + chunk_size]
        for i in range(0, len(route_coords), chunk_size)
    ]

    # initialize 10 vehicles spaced along route
    delay = 20
    moving_points = [route_coords[(i * delay) % len(route_coords)] for i in range(10)]

    return {"route_coords": route_coords, "route_chunks": route_chunks}


# ---- SIMULATION LOOP ----
async def simulation_loop():
    global moving_points, chunk_status, route_chunks

    index_offsets = [i * 20 for i in range(10)]

    # Pre-split route into chunks (BEFORE the loop)
    chunk_size = 20
    route_chunks = [
        route_coords[i : i + chunk_size]
        for i in range(0, len(route_coords), chunk_size)
    ]

    # Initialize chunk_status before loop
    chunk_status = ["green"] * len(route_chunks)
    log_timer = 0

    while True:
        # Move vehicles
        for i in range(len(moving_points)):
            index_offsets[i] = (index_offsets[i] + 1) % len(route_coords)
            moving_points[i] = route_coords[index_offsets[i]]
        
        signal_position = [28.635, 77.210] 
        

        # Compute traffic load per chunk
        chunk_status = []
        for chunk in route_chunks:
            count = sum(
                1
                for v in moving_points
                if any(
                    abs(v[0] - p[0]) < 0.0005 and abs(v[1] - p[1]) < 0.0005
                    for p in chunk
                )
            )
            chunk_status.append("red" if count >= 2 else "green")
        
        log_timer += 1
        if log_timer >= 33:  # 0.3s * 33 ≈ 10 sec
            record_traffic(signal_position, moving_points)
            log_timer = 0

        # Broadcast once per tick
        payload = {
            "moving_points": moving_points,
            "chunk_status": chunk_status,
            "route_chunks": route_chunks,
        }
        # print(payload)

        # Broadcast shared state
        for ws in list(clients):
            await ws.send_json(payload)

        await asyncio.sleep(0.5)


@app.on_event("startup")
async def start_simulation():
    asyncio.create_task(simulation_loop())


# ---- WEBSOCKET ----
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    clients.add(ws)
    try:
        while True:
            data = await ws.receive_text()
            print(f"Received: {data}")
            for client in clients:
                await client.send_text("HI from server")
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        clients.remove(ws)
        print("Client disconnected")


@app.get("/")
def read_root():
    return {"message": "WebSocket Traffic System Running ✅"}


def compute_green_time(density):
    base = 20
    scale = density * 1.2
    return int(min(max(base + scale, 20), 120))




def record_traffic(signal_position, moving_points):
    # count vehicles near signal
    density = sum(
        abs(p[0] - signal_position[0]) < 0.0008
        and abs(p[1] - signal_position[1]) < 0.0008
        for p in moving_points
    )
    predicted_density = predict_next_density(density)
    green_time = compute_green_time(predicted_density)

    now = datetime.now()
    row = [int(now.timestamp()), now.hour, now.weekday(), density]

    with open(DATA_FILE, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(row)

    print(f"📦 Logged data: {row}")  # debug





# predicting dencity of traffic  usng previous data

# df = pd.read_csv("traffic_history.csv")

# scaler = MinMaxScaler()
# scaled = scaler.fit_transform(df[['density', 'hour', 'weekday']].values)

# X = torch.tensor(scaled[:-1], dtype=torch.float32)
# y = torch.tensor(scaled[1:, 0], dtype=torch.float32)  # next-step density

# class LSTMModel(nn.Module):
#     def __init__(self):
#         super().__init__()
#         self.lstm = nn.LSTM(3, 32, batch_first=True)
#         self.fc = nn.Linear(32, 1)

#     def forward(self, x):
#         x, _ = self.lstm(x.unsqueeze(0))
#         return self.fc(x[:, -1])

# model = LSTMModel()
# optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
# loss_fn = nn.MSELoss()

# for epoch in range(200):
#     optimizer.zero_grad()
#     pred = model(X)
#     loss = loss_fn(pred.squeeze(), y)
#     loss.backward()
#     optimizer.step()
#     print(epoch, loss.item())

# torch.save(model.state_dict(), "signal_model.pt")


# for signal

# def density_to_green_time(pred_density):
#     base = 20  # min green seconds
#     scale = pred_density * 1.2
#     return int(min(max(base + scale, 20), 120))


# # variables

# current_phase = "NS"
# remaining_time = 0

# def update_signal(predicted_A, predicted_B):
#     global current_phase, remaining_time

#     green_A = density_to_green_time(predicted_A)
#     green_B = density_to_green_time(predicted_B)

#     if remaining_time <= 0:
#         if predicted_A > predicted_B:
#             current_phase = "NS"
#             remaining_time = green_A
#         else:
#             current_phase = "EW"
#             remaining_time = green_B
#     else:
#         remaining_time -= 1
