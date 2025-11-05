from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

load_dotenv()

TOMTOM_KEY = os.getenv("TOMTOM_KEY")

app = FastAPI()

# Allow requests from your React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# route
@app.get("/route")
def route(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    url = (
        f"https://api.tomtom.com/routing/1/calculateRoute/"
        f"{start_lat},{start_lon}:{end_lat},{end_lon}/json?key={TOMTOM_KEY}"
    )
    data = requests.get(url).json()
    points = data["routes"][0]["legs"][0]["points"]

    # Convert into [[lat,lon], [lat,lon], ...]
    coordinates = [[p["latitude"], p["longitude"]] for p in points]

    return {"path": coordinates}


# get Traffic Flow
def get_severity(current, free):
    ratio = current / free if free > 0 else 0
    if ratio > 0.75: return "low"
    if ratio > 0.45: return "moderate"
    if ratio > 0.20: return "heavy"
    return "emergency"

@app.get("/route-with-traffic")
def route_with_traffic(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    # print(start_lat)
    url = (
        f"https://api.tomtom.com/routing/1/calculateRoute/"
        f"{start_lat},{start_lon}:{end_lat},{end_lon}/json?key={TOMTOM_KEY}"
    )
    data = requests.get(url).json()
    #  print(data)
    points = data["routes"][0]["legs"][0]["points"]

    path = []
    for p in points:
        lat = p["latitude"]
        lon = p["longitude"]
        t_url = (
            f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?"
            f"key={TOMTOM_KEY}&point={lat},{lon}"
        )
        flow = requests.get(t_url).json()["flowSegmentData"]
        severity = get_severity(flow["currentSpeed"], flow["freeFlowSpeed"])
        path.append([lat, lon, severity])

    return {"segments": path}


@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}
    
