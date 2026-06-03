from fastapi import FastAPI
from sqlalchemy import inspect
from sqlalchemy import text

from database import engine
from models import Base

from routes.auth import router as auth_router
from routes.task import router as task_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://taskmanagementsystem-production-9ab1.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def ensure_task_columns():
    inspector = inspect(engine)

    if "tasks" not in inspector.get_table_names():
        return

    columns = {
        column["name"]
        for column in inspector.get_columns("tasks")
    }

    migrations = {
        "priority": "ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'medium'",
        "category": "ALTER TABLE tasks ADD COLUMN category VARCHAR(100) DEFAULT 'General'",
        "due_date": "ALTER TABLE tasks ADD COLUMN due_date DATE NULL",
        "created_at": "ALTER TABLE tasks ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
        "updated_at": "ALTER TABLE tasks ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
    }

    with engine.begin() as connection:
        for column_name, statement in migrations.items():
            if column_name not in columns:
                connection.execute(text(statement))


ensure_task_columns()

app.include_router(auth_router)
app.include_router(task_router)

@app.get("/")
def root():
    return {
        "message": "Task Manager API Running"
    }
