from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user, User
from app.core.database import get_db
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from typing import List, Optional

class AdminUserView(BaseModel):
    _id: str
    username: str
    email: str
    role: str
    disabled: bool
    created_at: datetime

class AdminLogView(BaseModel):
    email: str
    timestamp: datetime
    type: str
    content: str
    prompt: Optional[str] = None

class MessageResponse(BaseModel):
    message: str

class ProductResponse(BaseModel):
    message: str
    id: str

router = APIRouter()

ADMIN_EMAIL = "saketh@storyforge.com"

from app.core.auth import get_password_hash

async def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have administrative privileges."
        )
    return current_user

class AdminCreate(BaseModel):
    name: str
    email: str
    password: str

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: Optional[str] = None

@router.get("/users", response_model=List[AdminUserView], summary="Get all registered users")
async def get_all_users(admin: User = Depends(require_admin)):
    db = await get_db()
    users_cursor = db.users.find({}, {"hashed_password": 0})
    users = await users_cursor.to_list(length=100)
    # Convert _id to str if needed, but here simple dict is fine
    for u in users:
        u["_id"] = str(u["_id"])
    return users

@router.get("/logs", response_model=List[AdminLogView], summary="Get system activity logs")
async def get_activity_logs(admin: User = Depends(require_admin)):
    """
    Combined view of login logs and story interaction logs.
    Shows email, timestamp and prompts for admin visibility.
    Excludes the admin's own entries.
    """
    db = await get_db()
    
    # 1. Login activity
    login_logs_cursor = db.activity_logs.find(
        {}, 
        {"email": 1, "timestamp": 1, "_id": 0}
    ).sort("timestamp", -1)
    login_entries = await login_logs_cursor.to_list(length=250)
    for e in login_entries:
        e["type"] = "login"
        e["content"] = "User Logged In"

    # 2. Story activity
    story_logs_cursor = db.story_logs.find(
        {}, 
        {"email": 1, "timestamp": 1, "prompt": 1, "_id": 0}
    ).sort("timestamp", -1)
    story_entries = await story_logs_cursor.to_list(length=250)
    for e in story_entries:
        e["type"] = "story"
        e["content"] = e.get("prompt", "No prompt found")

    combined = login_entries + story_entries
    combined.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return combined[:500]

@router.post("/products", response_model=ProductResponse, summary="Create a new demo product")
async def create_product(product: ProductCreate, admin: User = Depends(require_admin)):
    db = await get_db()
    new_product = product.dict()
    new_product["created_at"] = datetime.now(timezone.utc)
    result = await db.products.insert_one(new_product)
    return {"message": "Product created", "id": str(result.inserted_id)}

@router.delete("/clear-logs", response_model=MessageResponse, summary="Total purge of activity logs")
async def clear_all_logs(admin: User = Depends(require_admin)):
    """
    Clears all activity and story logs from the database.
    """
    db = await get_db()
    await db.activity_logs.delete_many({})
    await db.story_logs.delete_many({})
    return {"message": "All logs cleared successfully"}

@router.post("/users/{email}/promote", response_model=MessageResponse, summary="Promote user to administrator")
async def promote_user(email: str, admin: User = Depends(require_admin)):
    db = await get_db()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.users.update_one(
        {"email": email},
        {"$set": {"role": "admin"}}
    )
    return {"message": f"User {email} has been promoted to Administrator"}

@router.delete("/users/{email}", response_model=MessageResponse, summary="Delete a user profile")
async def delete_user(email: str, admin: User = Depends(require_admin)):
    db = await get_db()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.users.delete_one({"email": email})
    return {"message": f"User {email} has been permanently deleted"}
