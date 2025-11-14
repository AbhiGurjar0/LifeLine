## for users
def userData(user):
    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}


def all_users_data(users):
    return [userData(user) for user in users]


## for signals
def trafficSignalData(signal):
    return {
        "id": str(signal["_id"]),
        "location": tuple(signal["location"]) if signal.get("location") else None,
        "status": signal.get("status", None),
        "last_updated": signal.get("last_updated"),
        "signal_Time": signal.get("signal_Time"),
        "waiting_Time": signal.get("waiting_Time"),
    }


def all_traffic_signals_data(signals):
    return [trafficSignalData(signal) for signal in signals]
