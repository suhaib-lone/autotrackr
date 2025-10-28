import asyncio
from telegram.ext import ApplicationBuilder
from dotenv import load_dotenv
import os

load_dotenv()
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

async def send_telegram_message(chat_id: str, message: str):
    try:
        if not TELEGRAM_BOT_TOKEN:
            print("ERROR: TELEGRAM_BOT_TOKEN not set; skipping Telegram send")
            return
        
        print(f"Attempting to send Telegram message to chat_id: {chat_id}")
        application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
        
        # Cast to int if numeric (Telegram user chat ids are integers)
        chat = int(chat_id) if isinstance(chat_id, str) and chat_id.lstrip('-').isdigit() else chat_id
        print(f"Sending message to chat: {chat} (type: {type(chat)})")
        
        await application.bot.send_message(chat_id=chat, text=message)
        print(f"✓ Message sent successfully to {chat}")
        await application.shutdown()
    except Exception as e:
        print(f"ERROR sending message to {chat_id}: {type(e).__name__}: {e}")
        # Do not re-raise; notification failures should not break business logic
        return

def send_message_sync(chat_id: str, message: str):
    try:
        asyncio.run(send_telegram_message(chat_id, message))
    except Exception as e:
        # Protect callers from asyncio event loop issues
        print(f"send_message_sync error for {chat_id}: {e}")
        return