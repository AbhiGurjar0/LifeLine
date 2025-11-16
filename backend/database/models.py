from pydantic import BaseModel, EmailStr
from typing import Dict, Tuple, Optional

class User(BaseModel):
    name: str
    email: EmailStr
    password: str    # Raw password during registration


class TrafficSignal(BaseModel):
    signal_Number: int
    location: Tuple[float, float]  # (latitude, longitude)
    status: Tuple[str, str]  # (NS_status, EW_status)
    last_updated: Optional[str] = None
    signal_Time: Optional[int] = None  # in seconds
    waiting_Time: Dict[str, int]  # in seconds






