from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from db import user_collection
from bson import ObjectId
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class TelegramUpdate(BaseModel):
    update_id: int
    message: dict = None


@router.post("/webhook")
async def telegram_webhook(update: dict):
    """
    Handle incoming Telegram webhook updates.
    When a user sends /start <token> to the bot, extract their chat_id and link it to their account.
    """
    try:
        logger.info(f"Received Telegram update: {update}")
        
        if "message" not in update:
            return {"ok": True}
        
        message = update["message"]
        chat_id = str(message["chat"]["id"])
        text = message.get("text", "")
        
        # Handle /start command with token
        if text.startswith("/start "):
            token = text.split(" ", 1)[1] if len(text.split(" ")) > 1 else None
            
            if token:
                # Find user by the token (we'll store temporary tokens in user document)
                user = user_collection.find_one({"telegram_token": token})
                
                if user:
                    # Update user with chat_id
                    user_collection.update_one(
                        {"_id": user["_id"]},
                        {
                            "$set": {"telegram_chat_id": chat_id},
                            "$unset": {"telegram_token": ""}
                        }
                    )
                    
                    # Send confirmation message
                    from utils.telegram import send_message_sync
                    send_message_sync(
                        chat_id,
                        f"✅ Successfully linked to your AutoTracker account!\n\nYou will now receive job notifications here."
                    )
                    logger.info(f"Linked Telegram chat_id {chat_id} to user {user.get('username')}")
                else:
                    from utils.telegram import send_message_sync
                    send_message_sync(
                        chat_id,
                        "❌ Invalid or expired link. Please generate a new link from the Settings page."
                    )
            else:
                from utils.telegram import send_message_sync
                send_message_sync(
                    chat_id,
                    "👋 Welcome to AutoTracker Bot!\n\nTo link your account, please use the link from your Settings page."
                )
        
        return {"ok": True}
    
    except Exception as e:
        logger.exception(f"Error processing Telegram webhook: {e}")
        return {"ok": True}  # Always return success to Telegram
