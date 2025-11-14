def userData(user):
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"]
    }

def all_users_data(users):
    return [userData(user) for user in users]