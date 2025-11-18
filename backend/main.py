import cv2
from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
import asyncio
from fastapi.middleware.cors import CORSMiddleware
import requests, asyncio, os
from Yolo.yolo_detection import detect_vehicles
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
import joblib


# import joblib
import sys
import os
import numpy as np
import math
from controllers.signal_controller import (
    get_traffic_signal,
    router as traffic_router,
    get_traffic_signals,
    update_traffic_signal,
)
from controllers.login_controller import router as login_router

from database.models import TrafficSignal, User
from training.train_signal_model import TrafficLSTM

app = FastAPI()


## middlewares

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(traffic_router, prefix="/traffic")
app.include_router(login_router, prefix="/admin")

## env
load_dotenv()
TOMTOM_KEY = os.getenv("TOMTOM_KEY")


#  GLOBAL SHARED STATE
moving_points = []  # 10 vehicles
route_coords = []  # full path
route_chunks = []
chunk_status = []

signal_position = [28.5677, 77.2080]
last_data_packet = {}
routes = []  # list of route dicts
counter = 0
clients = set()

DATA_FILE = "traffic_history.csv"

# create file with headers if not exists
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "hour", "weekday", "NS_density", "EW_density"])


sys.path.append(os.path.join(os.path.dirname(__file__), "training"))

## model loading
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


#  FETCH ROUTE


@app.get("/")
def read_root():
    return {"message": "WebSocket Traffic System Running ✅"}


## getting route cords
@app.get("/route")
async def route(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    # global route_coords, moving_points, route_chunks
    global routes

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

    # initialize 40 vehicles spaced along route
    delay = 20
    moving_points = [route_coords[(i * delay) % len(route_coords)] for i in range(40)]
    print("Route and vehicles initialized.")
    index_offsets = [i * 2 for i in range(len(moving_points))]

    route = {
        "route_coords": route_coords,
        "route_chunks": route_chunks,
        "moving_points": moving_points,
        "index_offsets": index_offsets,
    }
    if len(routes) == 0:
        routes.append(route)  # first route
    elif len(routes) == 1:
        routes.append(route)  # second route
    else:
        routes[0] = routes[1]  # shift last two forward
        routes[1] = route
    asyncio.create_task(simulation_loop())
    return {"routes": route}


@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    # Read image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Run YOLO detection
    count, boxes = detect_vehicles(frame)

    # Send back the detection summary
    return {"vehicle_count": count, "vehicles": boxes}


#  SIMULATION LOOP Calling
# @app.on_event("startup")
# async def start_simulation():
#     asyncio.create_task(simulation_loop())


## directional calculation
def get_direction(signal_pos, vehicle_pos):
    lat_s, lon_s = signal_pos
    lat_v, lon_v = vehicle_pos

    dlat = lat_v - lat_s
    dlon = lon_v - lon_s
    # define angular direction from the signal (rough)
    angle = math.degrees(
        math.atan2(dlat, dlon)
    )  # east=0°, north=90°, west=180/-180°, south=-90-
    if -45 <= angle <= 45:
        return "E"  # East
    elif 45 < angle <= 135:
        return "N"  # North
    elif angle > 135 or angle < -135:
        return "W"  # West
    else:
        return "S"  # South


## record traffic for training  and update signal
async def record_traffic(signal_number, moving_points):

    # signal position
    signal_details = (await get_traffic_signal(signal_number))["signal"]
    # print(signal_details)
    signal_position = signal_details[0]["location"]
    # print(signal_position)

    # count vehicles near signal per direction
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
    signal_details = await update_signal(signal_number, predicted_NS, predicted_EW)
    print("Updated Signal:", signal_details)

    # update signal in DB
    await update_traffic_signal(
        signal_number,
        {
            "status": [
                signal_details["curr_phase"],
                "EW" if signal_details["curr_phase"] == "NS" else "NS",
            ],
            "waiting_Time": (
                signal_details["wait_time"]["EW"]
                if signal_details["curr_phase"] == "NS"
                else signal_details["wait_time"]["NS"]
            ),
        },
    )

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


## updating Signal


async def update_signal(signal_number, predicted_A, predicted_B):
    global counter
    signal_change = None

    # load current db state for this signal
    signal_dt = await get_traffic_signal(signal_number)
    sig = signal_dt["signal"][0]

    # ensure types / safe defaults
    current_phase = sig.get("status", ["NS", "EW"])[0]  # "NS" or "EW"
    remaining_time = int(sig.get("signal_Time", 0))

    # waiting_Time must be a dict {"NS":int, "EW":int}
    wait_time = sig.get("waiting_Time") or {"NS": 0, "EW": 0}
    if not isinstance(wait_time, dict):
        # defensive recovery if DB is inconsistent
        try:
            # if it's an array like [ "10", "0" ] convert
            wait_time = {"NS": int(wait_time[0]), "EW": int(wait_time[1])}
        except Exception:
            wait_time = {"NS": 0, "EW": 0}

    # --- base config ---
    BASE_GREEN = 20
    MAX_EXTRA = 10
    MAX_GREEN = BASE_GREEN + MAX_EXTRA
    MIN_GREEN = 15
    SECONDS_PER_VEHICLE = 1.2

    def calculate_green_time(vehicle_count):
        base_time = MIN_GREEN + (vehicle_count * SECONDS_PER_VEHICLE)
        adjusted = min(MAX_GREEN, base_time**0.9)
        return int(adjusted)

    green_NS = calculate_green_time(predicted_A)
    green_EW = calculate_green_time(predicted_B)

    MAX_WAIT = 30

    # --- Decision & persistence ---
    if remaining_time <= 0:
        phase = current_phase
        # choose phase with fairness checks
        if wait_time.get("NS", 0) >= MAX_WAIT:
            current_phase = "NS"
            remaining_time = green_NS
            wait_time["NS"] = 0
            wait_time["EW"] = wait_time.get("EW", 0) + remaining_time
        elif wait_time.get("EW", 0) >= MAX_WAIT:
            current_phase = "EW"
            remaining_time = green_EW
            wait_time["EW"] = 0
            wait_time["NS"] = wait_time.get("NS", 0) + remaining_time
        else:
            # adaptive
            if predicted_A > predicted_B:
                current_phase = "NS"
                remaining_time = green_NS
            else:
                current_phase = "EW"
                remaining_time = green_EW

            wait_time[current_phase] = 0
            other = "EW" if current_phase == "NS" else "NS"
            wait_time[other] = wait_time.get(other, 0) + remaining_time
        if phase != current_phase:
            signal_change = True
        else:
            signal_change = False
        

        # Persist full new signal state (phase switch)
        update_payload = {
            "status": [current_phase, "EW" if current_phase == "NS" else "NS"],
            "signal_Time": int(remaining_time),
            "waiting_Time": {"NS": int(wait_time["NS"]), "EW": int(wait_time["EW"])},
        }
        await update_traffic_signal(signal_number, update_payload)

    else:
        # just decrement the timer and persist countdown + waiting_Time
        if counter % 2 == 0:
            remaining_time = int(remaining_time) - 1
        else:
            remaining_time = int(remaining_time) - 0
        counter = counter + 1
        if remaining_time < 0:
            remaining_time = 0

        update_payload = {
            "signal_Time": int(remaining_time),
            "waiting_Time": {"NS": int(wait_time["NS"]), "EW": int(wait_time["EW"])},
        }
        await update_traffic_signal(signal_number, update_payload)

    # return current state (accurate with DB now)
    return {
        "signal_Number": signal_number,
        "curr_phase": current_phase,
        "remain_time": int(remaining_time),
        "green_A": green_NS,
        "green_B": green_EW,
        "wait_time": {"NS": int(wait_time["NS"]), "EW": int(wait_time["EW"])},
        "signal_change": signal_change,
    }


def distance(a, b):
    ans = math.sqrt(((a[0] - b[0]) * 111000) ** 2 + ((a[1] - b[1]) * 111000) ** 2)
    return ans


#  SIMULATION LOOP
async def simulation_loop():
    global routes, last_data_packet
    # we will fetch signals each tick so we get fresh DB state
    index_offsets = [i * 2 for i in range(40)]
    chunk_status = []
    log_timer = 0
    tick_counter = 0

    # wait until routes initialized
    while not routes:
        print("⏳ Waiting for routes...", flush=True)
        await asyncio.sleep(1)

    moving_points = routes[0].get("moving_points", [])

    while True:
        # refresh signals each tick so we have latest DB state
        data = await get_traffic_signals()
        signals = data.get("signals", [])

        if not routes[0].get("route_coords") or not moving_points:
            print("⏳ Waiting for route initialization...", flush=True)
            await asyncio.sleep(1)
            continue

        if not signals:
            print("⚠️ No signals defined yet. Waiting...", flush=True)
            await asyncio.sleep(1)
            continue

        tick_counter += 1
        log_timer += 1
        all_routes_payload = []
        signal_counts = {}

        for route in routes:
            moving_points = route.get("moving_points", [])
            route_coords = route.get("route_coords", [])
            route_chunks = route.get("route_chunks", [])

            # Move vehicles
            index_offsets = route["index_offsets"]
            for i in range(len(moving_points)):

                should_move = True

                # Check signals
                for signal in signals:
                    sig_loc = signal["location"]
                    d = distance(moving_points[i], sig_loc)

                    if d < 45:
                        # determine direction
                        direction = (
                            "NS"
                            if abs(moving_points[i][0] - sig_loc[0])
                            < abs(moving_points[i][1] - sig_loc[1])
                            else "EW"
                        )

                        curr_phase = signal.get("status", ["NS", "EW"])[0]

                        # stop vehicle
                        if (direction == "NS" and curr_phase != "NS") or (
                            direction == "EW" and curr_phase != "EW"
                        ):
                            should_move = False
                            break

                # Move only once every 3 ticks
                if should_move and tick_counter % 3 == 0:
                    index_offsets[i] = (index_offsets[i] + 1) % len(route_coords)
                    moving_points[i] = route_coords[index_offsets[i]]

            # Every log interval (e.g., every 5 seconds) compute and update signals
            if log_timer >= 2:
                log_timer = 0
                for signal in signals:
                    ns_vehicles = []
                    ew_vehicles = []
                    for v in moving_points:
                        d = distance(v, signal["location"])
                        if d < 45:
                            if abs(v[0] - signal["location"][0]) < abs(
                                v[1] - signal["location"][1]
                            ):
                                ns_vehicles.append(v)
                            else:
                                ew_vehicles.append(v)

                    predicted_NS, predicted_EW = predict_next_density(
                        len(ns_vehicles), len(ew_vehicles)
                    )
                    # use signal_Number as identifier when calling update
                    sig_num = signal.get("signal_Number", signal.get("id", None))
                    if sig_num is None:
                        continue

                    get_signal_details = await update_signal(
                        sig_num, predicted_NS, predicted_EW
                    )

                    # update local 'signals' entry to reflect new DB info (so movement decisions use fresh data)
                    signal["status"] = [
                        get_signal_details["curr_phase"],
                        "EW" if get_signal_details["curr_phase"] == "NS" else "NS",
                    ]
                    signal["signal_Time"] = get_signal_details["remain_time"]
                    signal["waiting_Time"] = get_signal_details["wait_time"]
                    message = ""
                    if(signal_change := get_signal_details.get("signal_change")) is False:
                        message = f"Signal Time Extended by {get_signal_details['remain_time']}s"

                    signal_counts[sig_num] = {
                        "ns": len(ns_vehicles),
                        "ew": len(ew_vehicles),
                        "state": signal.get("status"),
                        "pred_NS": predicted_NS,
                        "pred_EW": predicted_EW,
                        "All_details": get_signal_details,
                        "message": message,
                    }

            # chunk status
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

            all_routes_payload.append(
                {
                    "moving_points": moving_points,
                    "chunk_status": chunk_status,
                    "route_chunks": route_chunks,
                    "route_coords": route_coords,
                    "signal_counts": signal_counts,
                }
            )

        # update long-lived packet so websocket movement logic can use it (if needed)
        last_data_packet = {"signal_details": signal_counts}

        payload = {"routes": all_routes_payload, "data_packet": last_data_packet}

        for ws in list(clients):
            try:
                await ws.send_json(payload)
            except Exception:
                try:
                    clients.remove(ws)
                except KeyError:
                    pass

        await asyncio.sleep(1)


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
