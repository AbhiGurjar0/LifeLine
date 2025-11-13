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
import numpy as np
import math

sys.path.append(os.path.join(os.path.dirname(__file__), "model"))

# Load model and scaler
from train_signal_model import TrafficLSTM  # ensure class is importable

model = TrafficLSTM()
model.load_state_dict(torch.load("signal_model.pt"))
model.eval()

scaler = joblib.load("signal_scaler.gz")


# predicting density
def predict_next_density(current_NS, current_EW):
    now = datetime.now()
    x = np.array([[current_NS, current_EW, now.hour, now.weekday()]])
    x_scaled = scaler.transform(x)
    x_tensor = torch.tensor(x_scaled, dtype=torch.float32)
    with torch.no_grad():
        pred = model(x_tensor).numpy()[0]
    # inverse transform
    inv = scaler.inverse_transform(
        [[pred[0], pred[1], now.hour / 23, now.weekday() / 6]]
    )[0]
    return int(max(0, inv[0])), int(max(0, inv[1]))


DATA_FILE = "traffic_history.csv"

# create file with headers if not exists
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "hour", "weekday", "NS_density", "EW_density"])


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

signal_position = [28.5677, 77.2080]
last_data_packet = {}

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
    moving_points = [route_coords[(i * delay) % len(route_coords)] for i in range(40)]

    return {"route_coords": route_coords, "route_chunks": route_chunks}


signals = [
    {"id": "signal1", "pos": (28.5708, 77.2087), "state": "NS_GREEN"},
    {"id": "signal2", "pos": (28.5708, 77.2084), "state": "EW_GREEN"},
]


# ---- SIMULATION LOOP ----
async def simulation_loop():
    global moving_points, chunk_status, route_chunks, last_data_packet

    index_offsets = [i * 2 for i in range(40)]
    chunk_status = []
    log_timer = 0
    tick_counter = 0

    while True:
        # 💤 Wait until the route and signals are ready
        if not route_coords or not moving_points:
            print("⏳ Waiting for route initialization...", flush=True)
            await asyncio.sleep(1)
            continue

        if not signals:
            print("⚠️ No signals defined yet. Waiting...", flush=True)
            await asyncio.sleep(1)
            continue

        print(
            f"✅ Running simulation | Vehicles={len(moving_points)} | Signals={len(signals)}",
            flush=True,
        )

        # Ensure route_chunks are valid (in case route just got updated)
        chunk_size = 20
        route_chunks = [
            route_coords[i : i + chunk_size]
            for i in range(0, len(route_coords), chunk_size)
        ]

        def distance(a, b):
            ans = math.sqrt(
                ((a[0] - b[0]) * 111000) ** 2 + ((a[1] - b[1]) * 111000) ** 2
            )
            return ans
        
        tick_counter += 1
        # 🚗 Move vehicles
        for i in range(len(moving_points)):
            should_move = True
            for signal in signals:
                d = distance(moving_points[i], signal["pos"])
                if d < 45:
                    direction = (
                        "NS"
                        if abs(moving_points[i][0] - signal["pos"][0])
                        < abs(moving_points[i][1] - signal["pos"][1])
                        else "EW"
                    )
                    curr_phase = last_data_packet.get("signal_details", {}).get(
                        "curr_phase"
                    )
                    if (direction == "NS" and curr_phase != "NS") or (
                        direction == "EW" and curr_phase != "EW"
                    ):
                        print("Stopped")
                        should_move = False

            if should_move:
                # if tick_counter % 3 == 0:
                    index_offsets[i] = (index_offsets[i] + 1) % len(route_coords)
                    moving_points[i] = route_coords[index_offsets[i]]

        # 🧾 Record and broadcast
        last_data_packet = record_traffic(signals[0]["pos"], moving_points)
        print("Recorded:", last_data_packet, flush=True)

        # 🧮 Count vehicles per signal
        signal_counts = {}  # store per signal ID

        for signal in signals:
            ns_vehicles = []
            ew_vehicles = []

            for v in moving_points:
                d = distance(v, signal["pos"])
                if d < 45:
                    if abs(v[0] - signal["pos"][0]) < abs(v[1] - signal["pos"][1]):
                        ns_vehicles.append(v)
                    else:
                        ew_vehicles.append(v)

            # save counts for this specific signal
            signal_counts[signal["id"]] = {
                "ns": len(ns_vehicles),
                "ew": len(ew_vehicles),
                "state": signal["state"]
            }

            print(
                f"{signal['id']} -> NS={len(ns_vehicles)} | EW={len(ew_vehicles)} | {signal['state']}",
                flush=True
            )

        # now update the main data packet safely
        last_data_packet.update({"signals": signal_counts})
        # 🧱 Compute chunk status
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

        payload = {
            "moving_points": moving_points,
            "chunk_status": chunk_status,
            "route_chunks": route_chunks,
            "data": last_data_packet,
        }

        for ws in list(clients):
            try:
                await ws.send_json(payload)
            except Exception:
                try:
                    clients.remove(ws)
                except KeyError:
                    pass

        await asyncio.sleep(1)


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


def get_direction(signal_pos, vehicle_pos):
    lat_s, lon_s = signal_pos
    lat_v, lon_v = vehicle_pos

    dlat = lat_v - lat_s
    dlon = lon_v - lon_s

    # define angular direction from the signal (rough)
    angle = math.degrees(
        math.atan2(dlat, dlon)
    )  # east=0°, north=90°, west=180/-180°, south=-90°

    if -45 <= angle <= 45:
        return "E"  # East
    elif 45 < angle <= 135:
        return "N"  # North
    elif angle > 135 or angle < -135:
        return "W"  # West
    else:
        return "S"  # South


def record_traffic(signal_position, moving_points):
    # count vehicles near signal

    directions = {"N": 0, "S": 0, "E": 0, "W": 0}

    for p in moving_points:
        # Check if vehicle is near the signal (radius check)
        if (
            abs(p[0] - signal_position[0]) < 0.001
            and abs(p[1] - signal_position[1]) < 0.001
        ):
            dir_label = get_direction(signal_position, p)
            directions[dir_label] += 1

    # you now have density per direction
    density_N, density_S, density_E, density_W = (
        directions["N"],
        directions["S"],
        directions["E"],
        directions["W"],
    )

    NS_density = density_N + density_S
    EW_density = density_E + density_W
    [predicted_NS, predicted_EW] = predict_next_density(NS_density, EW_density)
    print(predicted_NS, predicted_EW)
    signal_details = update_signal(predicted_NS, predicted_EW)

    now = datetime.now()
    row = [
        int(now.timestamp()),
        now.hour,
        now.weekday(),
        NS_density,
        EW_density,
    ]

    # with open(DATA_FILE, "a", newline="") as f:
    #     writer = csv.writer(f)
    #     writer.writerow(row)

    print(f"📦 Logged data per direction: {row}")
    print(f"Predicted densities: NS={predicted_NS}, EW={predicted_EW}")

    return {"signal_details": signal_details}


# for signal


current_phase = "NS"
remaining_time = 0


def update_signal(predicted_A, predicted_B):
    global current_phase, remaining_time

    # --- BASE VALUES ---
    BASE_GREEN = 20
    MAX_EXTRA = 10  # can extend max +40s for congestion
    MAX_GREEN = BASE_GREEN + MAX_EXTRA
    MIN_GREEN = 15  # safety margin, even for low traffic
    SECONDS_PER_VEHICLE = 1.2

    def calculate_green_time(vehicle_count):
        base_time = MIN_GREEN + (vehicle_count * SECONDS_PER_VEHICLE)

        # Smooth curve for large numbers: saturates slowly
        adjusted = min(MAX_GREEN, base_time**0.9)
        return int(adjusted)

    total_density = max(1, predicted_A + predicted_B)  # avoid divide-by-zero
    green_NS = calculate_green_time(predicted_A)
    green_EW = calculate_green_time(predicted_B)

    # # proportional allocation of green time
    # green_NS = int(max(MIN_GREEN, ratio_NS * MAX_GREEN))
    # green_EW = int(max(MIN_GREEN, ratio_EW * MAX_GREEN))
    # --- Fairness Tracker ---
    # if one side has waited too long, force switch
    MAX_WAIT = 30
    if not hasattr(update_signal, "wait_time"):
        update_signal.wait_time = {"NS": 0, "EW": 0}

    # --- Signal Switching Logic ---
    if remaining_time <= 0:
        # Check fairness before switching normally
        if update_signal.wait_time["NS"] >= MAX_WAIT:
            current_phase = "NS"
            remaining_time = green_NS
            update_signal.wait_time["NS"] = 0
            update_signal.wait_time["EW"] += remaining_time
        elif update_signal.wait_time["EW"] >= MAX_WAIT:
            current_phase = "EW"
            remaining_time = green_EW
            update_signal.wait_time["EW"] = 0
            update_signal.wait_time["NS"] += remaining_time
        else:
            # Normal adaptive selection
            if predicted_A > predicted_B:
                current_phase = "NS"
                remaining_time = green_NS
            else:
                current_phase = "EW"
                remaining_time = green_EW

            # update waiting times
            update_signal.wait_time[current_phase] = 0
            other = "EW" if current_phase == "NS" else "NS"
            update_signal.wait_time[other] += remaining_time
    else:
        remaining_time -= 1

    return {
        "curr_phase": current_phase,
        "remain_time": remaining_time,
        "green_A": green_NS,
        "green_B": green_EW,
        "wait_time": dict(update_signal.wait_time),
    }
