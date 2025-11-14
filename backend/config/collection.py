from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os

uri = os.getenv("MONGODB_URI")

client = MongoClient(uri, server_api=ServerApi('1'))

db = client.traffic_db
collection = db["traffic_collection"]
