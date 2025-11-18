from requests import request
from config import collection


async def is_logged_in(request, next):
    # Check if the user is logged in by verifying session or token
    try:
        token = request.headers.get("Authorization")
        if not token:
            return {"message": "Not logged in"}
        email = request.headers.get("Email")
        if not email:
            return {"message": "Email header missing"}
        user = collection.find_one({"email": email})
        if not user:
            return {"message": "User not found"}
        request.user = user  # Attach user info to request
        return await next(request)
    except Exception as e:
        return {"message": "Error verifying login status", "error": str(e)}
