import asyncio
from telegram.ext import ApplicationBuilder
from dotenv import load_dotenv
import os

load_dotenv()
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

async def send_telegram_message(chat_id: str, message: str):
    try:
        application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
        await application.bot.send_message(chat_id=chat_id, text=message)
        await application.shutdown()
    except Exception as e:
        print(f"Error sending message to {chat_id}: {e}")
        raise e

def send_message_sync(chat_id: str, message: str):
    asyncio.run(send_telegram_message(chat_id, message))