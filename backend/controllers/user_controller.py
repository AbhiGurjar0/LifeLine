from .database import users_collection
from .security import hash_password
from bson import ObjectId


async def create_user(user_data):
    user_data["password"] = hash_password(user_data["password"])
    
    result = await users_collection.insert_one(user_data)

    return str(result.inserted_id)

async def get_user_by_email(email: str):
    user = await users_collection.find_one({"email": email})
    return user

async def get_user_by_id(id: str):
    user = await users_collection.find_one({"_id": ObjectId(id)})
    return user
