from database.schemas import all_traffic_signals_data
from config.collection import collection
from database.models import TrafficSignal
from bson.objectid import ObjectId
from fastapi import APIRouter

router = APIRouter()


@router.get("/signals")
async def get_traffic_signals():
    data = collection.find()
    signals = all_traffic_signals_data(data)
    return {"signals": signals}


@router.get("/signal/{signal_num}")
async def get_traffic_signal(signal_num: int):
    data = collection.find_one({"signal_Number": signal_num})
    signal = all_traffic_signals_data([data]) if data else None
    return {"signal": signal}


@router.post("/add_signal")
async def add_traffic_signal(new_signal: TrafficSignal):
    is_Exist = collection.find_one({"location": new_signal.location})
    if is_Exist:
        return {"message": "Traffic signal at this location already exists"}
    collection.insert_one(dict(new_signal))
    return {"message": "Traffic signal added successfully"}


@router.put("/update_signal/{signal_Number}")
async def update_traffic_signal(signal_Number: int, updated_signal: TrafficSignal):
    is_Exist = collection.find_one({"signal_Number": signal_Number})
    if not is_Exist:
        return {"message": "Traffic signal not found"}
    collection.update_one({"signal_Number": signal_Number}, {"$set": dict(updated_signal)})
    return {"message": "Traffic signal updated successfully"}


@router.delete("/delete_signal/{signal_id}")
async def delete_traffic_signal(signal_id: str):
    signal_id = ObjectId(signal_id)
    is_Exist = collection.find_one({"_id": signal_id})
    if not is_Exist:
        return {"message": "Traffic signal not found"}
    collection.delete_one({"_id": signal_id})
    return {"message": "Traffic signal deleted successfully"}
