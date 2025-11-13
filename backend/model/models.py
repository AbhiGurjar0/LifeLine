from pydantic import BaseModel, EmailStr
from typing import Optional

class UserIn(BaseModel):
    name: str
    email: EmailStr
    password: str    # Raw password during registration

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
