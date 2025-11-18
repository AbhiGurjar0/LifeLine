import email
from database.schemas import all_users_data
from config.collection import collection
from database.models import User , LoginData
from bson.objectid import ObjectId
import bcrypt
from fastapi import APIRouter

router = APIRouter()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


@router.get("/users")
async def get_users():
    data = collection.find()
    users = all_users_data(data)
    return {"users": users}


@router.post("/register_user")
async def add_user(new_user: User):
    new_user.password = hash_password(new_user.password)
    collection.insert_one(dict(new_user))
    return {"message": "User added successfully"}


@router.put("/update_user/{user_id}")
async def update_user(user_id: str, updated_user: User):
    user_id = ObjectId(user_id)
    is_Exist = collection.find_one({"_id": user_id})
    if not is_Exist:
        return {"message": "User not found"}
    collection.update_one({"_id": user_id}, {"$set": dict(updated_user)})
    return {"message": "User updated successfully"}


@router.delete("/logout_user/{user_id}")
async def delete_user(user_id: str):
    user_id = ObjectId(user_id)
    is_Exist = collection.find_one({"_id": user_id})
    if not is_Exist:
        return {"message": "User not found"}
    collection.delete_one({"_id": user_id})
    return {"message": "User deleted successfully"}


@router.post("/login_user")
async def login_user(data: LoginData):
    user = collection.find_one({"email": data.email})
    if not user:
        return {"message": "Invalid credentials"}
    is_valid = verify_password(data.password, user["password"])
    if not is_valid:
        return {"message": "Invalid credentials"}
    return {"message": "User logged in successfully"}
