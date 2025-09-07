from fastapi import FastAPI
from auth import router as auth_router
from jobs import router as jobs_router

app = FastAPI()
app.include_router(auth_router, prefix="/auth")
app.include_router(jobs_router, prefix="/jobs")

@app.get("/")
def status():
    return {"message": "AutoTracker app is running!"}