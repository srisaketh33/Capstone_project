import re
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.auth import Token, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_password_hash, verify_password, get_current_user
from app.core.database import get_db
from datetime import timedelta, datetime, timezone
from pydantic import BaseModel, Field

router = APIRouter()

class UserCreate(BaseModel):
    name: str = Field(..., description="The user's full name")
    email: str = Field(..., description="The user's email address (used for login)")
    password: str = Field(..., description="The user's password (min 8 chars, 1 uppercase, 1 digit)")
    username: str = Field(None, description="Optional username (defaults to email)")
    role: str = Field("user", description="The user's role (defaults to 'user')")

class MessageResponse(BaseModel):
    message: str

class UserStatusResponse(BaseModel):
    history_enabled: bool
    login_count: int
    role: str

def validate_password_complexity(password: str):
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one capital letter."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one numeric character."
    if not re.search(r"[a-zA-Z]", password):
        return False, "Password must contain at least one alpha letter."
    return True, ""

@router.post("/register", response_model=MessageResponse, summary="Register a new user")
async def register(user: UserCreate):
    """
    Creates a new user account in the system.
    Validation is performed on email uniqueness and password complexity.
    """
    db = await get_db()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"username": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    is_valid, msg = validate_password_complexity(user.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )
    
    new_user = {
        "username": user.username or user.email,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "hashed_password": get_password_hash(user.password),
        "disabled": False,
        "created_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(new_user)
    
    return {"message": "User registered successfully"}

@router.post("/login", response_model=Token, summary="Login for access token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticates a user and returns a JWT access token.
    Accepts email or username in the 'username' field of the form.
    """
    db = await get_db()
    
    # Try finding user by username OR email
    user = await db.users.find_one({
        "$or": [
            {"username": form_data.username},
            {"email": form_data.username}
        ]
    })
    
    # Special case: Seed Admin if not exists and trying to login with Admin credentials
    target_admin_email = "saketh@storyforge.com"
    if not user and (form_data.username == "Admin" or form_data.username == target_admin_email):
         # Double check if any admin exists by email before seeding
         existing_admin = await db.users.find_one({"role": "admin", "email": target_admin_email})
         if not existing_admin:
             hashed_pw = get_password_hash("Saketh@123")
             user = {
                "username": "Admin",
                "email": target_admin_email,
                "name": "Admin",
                "role": "admin",
                "hashed_password": hashed_pw,
                "disabled": False,
                "created_at": datetime.now(timezone.utc)
             }
             await db.users.insert_one(user)
             print(f"INFO: Successfully seeded Admin with email {target_admin_email} and role admin.")
         else:
             user = existing_admin

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    login_email = user.get("email", user["username"])
    await db.activity_logs.insert_one({
        "email": login_email,
        "event": "login",
        "timestamp": datetime.now(timezone.utc)
    })

    # --- Auto-delete excess: Keep only latest 10 login logs total ---
    login_logs_cursor = db.activity_logs.find().sort("timestamp", -1)
    login_logs = await login_logs_cursor.to_list(length=100)
    if len(login_logs) > 10:
        ids_to_keep = [log["_id"] for log in login_logs[:10]]
        await db.activity_logs.delete_many({
            "_id": {"$nin": ids_to_keep}
        })
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    display_name = user.get("name")
    if not display_name:
        display_name = user["username"].split("@")[0].capitalize()
        
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "name": display_name,
        "role": user["role"]
    }

@router.get("/status", response_model=UserStatusResponse, summary="Get current user status")
async def get_user_status(current_user: UserStatusResponse = Depends(get_current_user)):
    """
    Check if the user is eligible for certain features (like History).
    """
    db = await get_db()
    
    # Root/Admin always has history enabled
    if current_user.role == "admin":
        return {"history_enabled": True, "login_count": 999, "role": "admin"}
        
    # Count normal user logins
    login_count = await db.activity_logs.count_documents({
        "email": current_user.email,
        "event": "login"
    })
    
    return {
        "history_enabled": login_count >= 2,
        "login_count": login_count,
        "role": current_user.role
    }
