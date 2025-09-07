from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()
SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM=os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password:str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password:str, hashed_password:str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, secret_key: str, algorithm: str, expirey_minutes: int)->str:
    to_encode=data.copy()
    expirey=datetime.now() + timedelta(minutes=expirey_minutes)
    to_encode.update({"exp": expirey})
    return jwt.encode(to_encode,secret_key, algorithm=algorithm)

def decode_access_token(token:str)-> dict:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    