import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
mongo_uri=os.getenv("MONGO_URI")

mongo_client = MongoClient(mongo_uri)
db=mongo_client.get_database("autotrackrDB")
user_collection=db.get_collection("users")
job_collection=db.get_collection("jobs")