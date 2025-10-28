from fastapi import APIRouter,HTTPException,Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from models import UserLogin, UserCreate,SkillsUpdate
from db import user_collection
from utils.security import hash_password, verify_password, create_access_token, decode_access_token ,SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from bson import ObjectId
router=APIRouter()

oauth_scheme= OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/signup")
def signup(user:UserCreate):
    if not user.username or not user.email or not user.password:
        raise HTTPException(status_code=400, detail="All fields are required")
    existing_user= user_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="username already exists")
    user_dict=user.model_dump()
    user_dict["password"]= hash_password(user_dict["password"])
    user_collection.insert_one(user_dict)
    return {"message": "User created successfully"}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    existing_user = user_collection.find_one({"username": form_data.username})
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    if verify_password(form_data.password, existing_user["password"])==False:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    access_token=create_access_token(data={"sub":form_data.username},secret_key=SECRET_KEY, algorithm=ALGORITHM, expirey_minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return {"access_token": access_token, "token_type": "bearer"}


def get_current_user(token:str = Depends(oauth_scheme)):
    credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload= decode_access_token(token)
        username= payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = user_collection.find_one({"username": username})
    if user is None:
        raise credentials_exception
    user["_id"] = str(user["_id"])
    return user

@router.put("/skills")
def update_skills(update: SkillsUpdate, current_user: dict = Depends(get_current_user)):
    skills = update.skills
    if not isinstance(skills, list):
        raise HTTPException(status_code=400, detail="skills must be a list")
    user_collection.update_one({"_id": ObjectId(current_user["_id"])}, {"$set": {"skills": skills}})
    return {"message": "Skills updated", "skills": skills}

@router.get("/me")
def read_current_user(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "email": current_user["email"],
        "telegram_chat_id": current_user.get("telegram_chat_id", ""),
        "skills": current_user.get("skills", [])
    }

@router.put("/telegram")
def update_telegram_chat_id(data: dict, current_user: dict = Depends(get_current_user)):
    telegram_chat_id = data.get("telegram_chat_id", "").strip()
    user_collection.update_one(
        {"_id": ObjectId(current_user["_id"])}, 
        {"$set": {"telegram_chat_id": telegram_chat_id}}
    )
    return {"message": "Telegram Chat ID updated successfully", "telegram_chat_id": telegram_chat_id}

@router.get("/telegram/link")
def generate_telegram_link(current_user: dict = Depends(get_current_user)):
    """
    Generate a unique deep link for the user to connect their Telegram account.
    The link includes a temporary token that will be exchanged for the chat_id.
    """
    import secrets
    import os
    
    # Generate a unique token
    token = secrets.token_urlsafe(32)
    
    # Store the token temporarily in the user document
    user_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"telegram_token": token}}
    )
    
    # Get bot username from environment
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    if not bot_token:
        raise HTTPException(status_code=500, detail="Telegram bot not configured")
    
    # Extract bot username from token (format: bot_id:token)
    # For now, we'll use a placeholder or you can set BOT_USERNAME env variable

    bot_username = os.getenv("TELEGRAM_BOT_USERNAME","")
    
    # Create deep link
    deep_link = f"https://t.me/{bot_username}?start={token}"
    
    return {
        "link": deep_link,
        "token": token,
        "bot_username": bot_username
    }

@router.post("/telegram/test")
def test_telegram_notification(current_user: dict = Depends(get_current_user)):
    """
    Test endpoint to verify Telegram notifications are working.
    Sends a test message to the user's connected Telegram chat.
    """
    from utils.telegram import send_message_sync
    
    chat_id = current_user.get("telegram_chat_id")
    if not chat_id:
        raise HTTPException(
            status_code=400, 
            detail="No Telegram chat ID found. Please connect your Telegram account first."
        )
    
    print(f"TEST: Sending test message to chat_id: {chat_id}")
    message = "🧪 Test Message\n\nThis is a test notification from AutoTracker. If you see this, your Telegram notifications are working! ✅"
    
    try:
        send_message_sync(chat_id, message)
        return {
            "success": True,
            "message": "Test notification sent! Check your Telegram.",
            "chat_id": chat_id
        }
    except Exception as e:
        print(f"TEST ERROR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send test message: {str(e)}"
        )
