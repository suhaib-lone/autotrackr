from datetime import datetime, timezone
from bson import ObjectId
from models import Job
from fastapi import APIRouter, Depends, HTTPException
from models import Job, JobCreate, PyObjectId
from db import job_collection
from auth import get_current_user
from typing import List
from utils.telegram import send_message_sync
router=APIRouter()

@router.post("/", response_model=Job)
def create_job(job: JobCreate, current_user: dict = Depends(get_current_user)):
    try:
        job_dict = job.model_dump()
        job_dict["owner_id"] = str(current_user["_id"])
        job_dict["date_added"] = datetime.now(timezone.utc)
        
        # Create MongoDB document with ObjectId
        mongo_doc = {
            **job_dict,
            "owner_id": ObjectId(job_dict["owner_id"])
        }
        result = job_collection.insert_one(mongo_doc)
        job_dict["_id"] = str(result.inserted_id)

        # Send Telegram notification
        try:
            chat_id = current_user.get("telegram_chat_id")
            print(f"DEBUG: User telegram_chat_id: {chat_id}")
            if chat_id:
                message = (
                    f"🆕 New Job Added!\n\n"
                    f"📋 Title: {job_dict['title']}\n"
                    f"🏢 Company: {job_dict['company']}\n"
                    f"📍 Location: {job_dict.get('location', 'Remote/Not Specified')}\n"
                    f"🔗 Link: {job_dict.get('link', 'N/A')}"
                )
                print(f"DEBUG: Attempting to send Telegram notification...")
                send_message_sync(chat_id, message)
            else:
                print("DEBUG: No telegram_chat_id found for user, skipping notification")
        except Exception as e:
            print(f"ERROR: Failed to send Telegram notification: {str(e)}")
            # Don't fail job creation if notification fails
        
        return Job(**job_dict)
    except Exception as e:
        print(f"Error in create_job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")

@router.get("/", response_model=List[Job])
def get_jobs(current_user: dict = Depends(get_current_user)):
    user_id = ObjectId(current_user["_id"]) if isinstance(current_user["_id"], str) else current_user["_id"]
    
    cursor = job_collection.find({"owner_id": user_id})
    jobs = []
    for job in cursor:
        job_dict = {
            **job,
            "_id": str(job["_id"]),
            "owner_id": str(job["owner_id"])
        }
        jobs.append(Job(**job_dict))
    return jobs

@router.get("/{job_id}", response_model=Job)
def get_job(job_id: str, current_user: dict = Depends(get_current_user)):
    user_id = ObjectId(current_user["_id"]) if isinstance(current_user["_id"], str) else current_user["_id"]
    
    job = job_collection.find_one({"_id": ObjectId(job_id), "owner_id": user_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job_dict = {
        **job,
        "_id": str(job["_id"]),
        "owner_id": str(job["owner_id"])
    }
    return Job(**job_dict)

@router.put("/{job_id}", response_model=Job)
def update_job(job_id: str, job: JobCreate, current_user: dict = Depends(get_current_user)):
    user_id = ObjectId(current_user["_id"]) if isinstance(current_user["_id"], str) else current_user["_id"]
    
    result = job_collection.update_one(
        {"_id": ObjectId(job_id), "owner_id": user_id},
        {"$set": job.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="job not found")
    
    updated_job = job_collection.find_one({"_id": ObjectId(job_id)})
    job_dict = {
        **updated_job,
        "_id": str(updated_job["_id"]),
        "owner_id": str(updated_job["owner_id"])
    }
    
    # Send Telegram notification about the update
    try:
        chat_id = current_user.get("telegram_chat_id")
        print(f"DEBUG: User telegram_chat_id (update): {chat_id}")
        if chat_id:
            message = (
                f"✏️ Job Updated!\n\n"
                f"📋 Title: {job_dict['title']}\n"
                f"🏢 Company: {job_dict['company']}\n"
                f"📍 Location: {job_dict.get('location', 'Remote/Not Specified')}\n"
                f"🔗 Link: {job_dict.get('link', 'N/A')}"
            )
            print(f"DEBUG: Attempting to send Telegram update notification...")
            send_message_sync(chat_id, message)
        else:
            print("DEBUG: No telegram_chat_id found for user, skipping update notification")
    except Exception as e:
        print(f"ERROR: Failed to send Telegram update notification: {str(e)}")
        # Don't fail job update if notification fails
    
    return Job(**job_dict)

@router.delete("/{job_id}")
def delete_job(job_id: str, current_user: dict = Depends(get_current_user)):
    # Verify the job exists and belongs to the user first
    job = job_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if str(job["owner_id"]) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to delete this job")

    result = job_collection.delete_one({"_id": ObjectId(job_id)})
    return {"message": "Job deleted successfully"}