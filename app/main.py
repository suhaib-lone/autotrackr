from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from jobs import router as jobs_router
from telegram_routes import router as telegram_router
from db import is_db_connected

app = FastAPI()

# Configure CORS - must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(jobs_router, prefix="/jobs")
app.include_router(telegram_router, prefix="/telegram")


@app.get("/")
def status():
    return {
        "message": "AutoTracker app is running!",
        "db_connected": is_db_connected(),
    }