import os
import logging
from dotenv import load_dotenv
from pymongo import MongoClient, errors

load_dotenv()

# Configuration from env
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "autotrackrDB")

# Exports
mongo_client = None
db = None
user_collection = None
job_collection = None

if MONGO_URI:
	try:
		# Fail fast when the URI is invalid or DNS can't be resolved
		mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
		# quick health check
		mongo_client.admin.command("ping")
		db = mongo_client.get_database(DB_NAME)
		user_collection = db.get_collection("users")
		job_collection = db.get_collection("jobs")
		logging.info("Connected to MongoDB database '%s'", DB_NAME)
	except Exception as exc:  # pragma: no cover - environment dependent
		logging.exception("Could not connect to MongoDB: %s", exc)
		mongo_client = None
		db = None
		user_collection = None
		job_collection = None
else:
	logging.warning("MONGO_URI not set; MongoDB features disabled.")


def is_db_connected() -> bool:
	"""Return True when a MongoDB connection is available."""
	return mongo_client is not None


def require_collections():
	"""Return (user_collection, job_collection) or raise RuntimeError if DB not connected."""
	if not is_db_connected():
		raise RuntimeError("MongoDB is not connected. Set MONGO_URI or check your connection.")
	return user_collection, job_collection