from fastapi import APIRouter,HTTPException,Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from models import UserLogin, UserCreate
from db import user_collection
from utils.security import hash_password, verify_password, create_access_token, decode_access_token ,SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
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

# @router.get("/me")
# def read_current_user(current_user: dict = Depends(get_current_user)):
#     return {"username": current_user["username"], "email": current_user["email"]}