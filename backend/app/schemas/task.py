from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel

from app.models.task import TaskStatus


# Shared properties
class TaskBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    is_public: Optional[bool] = False
    week_number: Optional[int] = None
    year: Optional[int] = None


# Properties to receive on task creation
class TaskCreate(TaskBase):
    title: str
    week_number: int
    year: int


# Properties to receive on task update
class TaskUpdate(TaskBase):
    pass


# Properties shared by models stored in DB
class TaskInDBBase(TaskBase):
    id: int
    title: str
    status: TaskStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner_id: int
    week_number: int
    year: int

    class Config:
        orm_mode = True


# Properties to return to client
class Task(TaskInDBBase):
    pass


# Properties stored in DB
class TaskInDB(TaskInDBBase):
    pass


# Properties for task export
class TaskExport(BaseModel):
    tasks: List[Task]
    start_date: datetime
    end_date: datetime
    user_name: str
    user_email: str 