from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import requests, asyncio, os
from dotenv import load_dotenv

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
moving_points = []   # 10 vehicles
route_coords = []    # full path
chunk_statuses = []
route_chunks = []

clients = set()

# ---- FETCH ROUTE ----
@app.get("/route")
def route(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    global route_coords, moving_points

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
        route_coords[i:i+chunk_size]
        for i in range(0, len(route_coords), chunk_size)
    ]

    # initialize 10 vehicles spaced along route
    delay = 20
    moving_points = [
        route_coords[(i * delay) % len(route_coords)]
        for i in range(10)
    ]

    return { "route_coords": route_coords,
        "route_chunks": route_chunks}


# ---- SIMULATION LOOP ----
async def simulation_loop():
    global moving_points, chunk_status

    index_offsets = [i * 20 for i in range(10)]

    # Pre-split route into chunks
    chunk_size = 20
    route_chunks = [
        route_coords[i:i+chunk_size]
        for i in range(0, len(route_coords), chunk_size)
    ]

    while True:
        # Move vehicles
        for i in range(len(moving_points)):
            index_offsets[i] = (index_offsets[i] + 1) % len(route_coords)
            moving_points[i] = route_coords[index_offsets[i]]

        # Compute traffic load per chunk
        chunk_status = []
        for chunk in route_chunks:
            count = sum(
                1 for v in moving_points
                if any(abs(v[0]-p[0])<0.0005 and abs(v[1]-p[1])<0.0005 for p in chunk)
            )
            chunk_status.append("red" if count >= 2 else "green")

        # Broadcast shared state
        for ws in list(clients):
            await ws.send_json({
                "moving_points": moving_points,
                "chunk_status": chunk_status,
                "route_chunks": route_chunks
            })

        await asyncio.sleep(0.3)



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
            await asyncio.sleep(1)  # keep connection alive
    except WebSocketDisconnect:
        clients.remove(ws)

@app.get("/")
def read_root():
    return {"message": "WebSocket Traffic System Running ✅"}
