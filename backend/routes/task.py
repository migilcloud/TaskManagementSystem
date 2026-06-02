from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session
from typing import Any

from database import SessionLocal
from models import Task
from schemas import TaskCreate
from schemas import TaskUpdate

from security import verify_token

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def format_date_value(value: Any):
    if value is None:
        return None

    if hasattr(value, "isoformat"):
        return value.isoformat()

    return str(value)


def serialize_task(task: Task):
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description or "",
        "status": task.status or "pending",
        "priority": task.priority or "medium",
        "category": task.category or "General",
        "due_date": format_date_value(getattr(task, "due_date", None)),
        "created_at": format_date_value(getattr(task, "created_at", None)),
        "updated_at": format_date_value(getattr(task, "updated_at", None)),
    }


# CREATE TASK

@router.post("/")
def create_task(
    task: TaskCreate,
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    new_task = Task(
        user_id=payload["user_id"],
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        category=task.category,
        due_date=task.due_date
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "message": "Task created successfully",
        "task": serialize_task(new_task),
        "logged_in_user": payload["email"]
    }


# GET ALL TASKS

@router.get("/")
def get_tasks(
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    tasks = (
        db.query(Task)
        .filter(
            Task.user_id == payload["user_id"]
        )
        .order_by(Task.created_at.desc())
        .all()
    )

    return {
        "user": payload["email"],
        "tasks": [serialize_task(task) for task in tasks]
    }


# UPDATE TASK

@router.put("/{task_id}")
def update_task(
    task_id: int,
    updated_task: TaskUpdate,
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == payload["user_id"]
        )
        .first()
    )

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    setattr(task, "title", updated_task.title)
    setattr(task, "description", updated_task.description)
    setattr(task, "status", updated_task.status)
    setattr(task, "priority", updated_task.priority)
    setattr(task, "category", updated_task.category)
    setattr(task, "due_date", updated_task.due_date)

    db.commit()
    db.refresh(task)

    return {
        "message": "Task updated successfully",
        "task": serialize_task(task),
        "user": payload["email"]
    }


# DELETE TASK

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == payload["user_id"]
        )
        .first()
    )

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully",
        "user": payload["email"]
    }
