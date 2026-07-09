"""
schemas.py — Pydantic data validation schemas

WHAT IS PYDANTIC?
  Pydantic validates incoming data automatically. When a user submits a form,
  FastAPI uses these schemas to:
  1. Parse the JSON body
  2. Validate that required fields exist and have correct types
  3. Return a nice error message if something is wrong

  These schemas are NOT database tables — they define what data travels
  OVER THE NETWORK (request bodies and response shapes).
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Any


# ─── AUTH SCHEMAS ──────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    """What we expect when someone registers a new account."""
    username: str
    email: EmailStr   # Pydantic validates it's a real email format automatically
    password: str     # Plain text coming in — we hash it before storing


class UserLogin(BaseModel):
    """What we expect when someone logs in."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """What we send BACK after a successful login/register."""
    access_token: str   # The JWT token the frontend will store
    token_type: str = "bearer"
    user_id: int
    username: str


class UserOut(BaseModel):
    """Safe representation of a user (never includes the password)."""
    id: int
    username: str
    email: str
    created_at: datetime

    # This tells Pydantic: "you can build me from a SQLAlchemy model object directly"
    model_config = {"from_attributes": True}


# ─── SESSION SCHEMAS ────────────────────────────────────────────────────────

class SessionOut(BaseModel):
    """
    What we send back when listing session history.
    We include the scenario and a parsed version of the dashboard data.
    """
    id: int
    scenario: str
    dashboard_data: Optional[Any] = None   # Parsed JSON (dict)
    created_at: datetime

    model_config = {"from_attributes": True}
