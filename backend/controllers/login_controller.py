from database.schemas import all_users_data
from config.collection import collection
from database.models import User
from bson.objectid import ObjectId
import bcrypt


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


@app.get("/users")
async def get_users():
    data = collection.find()
    users = all_users_data(data)
    return {"users": users}


@app.post("/login_user")
async def add_user(new_user: User):
    new_user.password = hash_password(new_user.password)
    collection.insert_one(dict(new_user))
    return {"message": "User added successfully"}


@app.put("/update_user/{user_id}")
async def update_user(user_id: str, updated_user: User):
    user_id = ObjectId(user_id)
    is_Exist = collection.find_one({"_id": user_id})
    if not is_Exist:
        return {"message": "User not found"}
    collection.update_one({"_id": user_id}, {"$set": dict(updated_user)})
    return {"message": "User updated successfully"}


@app.delete("/logout_user/{user_id}")
async def delete_user(user_id: str):
    user_id = ObjectId(user_id)
    is_Exist = collection.find_one({"_id": user_id})
    if not is_Exist:
        return {"message": "User not found"}
    collection.delete_one({"_id": user_id})
    return {"message": "User deleted successfully"}
