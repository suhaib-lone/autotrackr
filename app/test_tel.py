import requests

BOT_TOKEN = "7967579089:AAHV6wWTZ_-jiJx-uig7Mthrfpi8_ai0pZQ"   # Replace with your token
CHAT_ID = "1485950303"         # Your chat_id
MESSAGE = "Hello Suhaib 🚀! Telegram notifications are working!"

url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
payload = {
    "chat_id": CHAT_ID,
    "text": MESSAGE
}

res = requests.post(url, json=payload)

print(res.status_code, res.json())
