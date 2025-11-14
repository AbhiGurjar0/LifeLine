from pydantic import BaseModel, EmailStr
from typing import Optional, Tuple

class User(BaseModel):
    name: str
    email: EmailStr
    password: str    # Raw password during registration


class TrafficSignal(BaseModel):
    location: Tuple[float, float]  # (latitude, longitude)
    status: str
    last_updated: Optional[str] = None
    signal_Time: Optional[int] = None  # in seconds
    waiting_Time: Optional[int] = None  # in seconds






