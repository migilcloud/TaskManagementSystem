from datetime import date
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# TASK SCHEMAS

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(default="", max_length=500)
    status: Literal["pending", "in_progress", "completed"] = "pending"
    priority: Literal["low", "medium", "high"] = "medium"
    category: str = Field(default="General", max_length=100)
    due_date: date | None = None


class TaskUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(default="", max_length=500)
    status: Literal["pending", "in_progress", "completed"]
    priority: Literal["low", "medium", "high"] = "medium"
    category: str = Field(default="General", max_length=100)
    due_date: date | None = None
