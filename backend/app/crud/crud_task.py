from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate


class CRUDTask(CRUDBase[Task, TaskCreate, TaskUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: TaskCreate, owner_id: int
    ) -> Task:
        db_obj = Task(
            title=obj_in.title,
            description=obj_in.description,
            status=obj_in.status or TaskStatus.TODO,
            is_public=obj_in.is_public,
            owner_id=owner_id,
            week_number=obj_in.week_number,
            year=obj_in.year,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Task]:
        return (
            db.query(Task)
            .filter(Task.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_public_tasks(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Task]:
        return (
            db.query(Task)
            .filter(Task.is_public == True)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_tasks_by_week(
        self, db: Session, *, owner_id: int, week_number: int, year: int
    ) -> List[Task]:
        return (
            db.query(Task)
            .filter(
                Task.owner_id == owner_id,
                Task.week_number == week_number,
                Task.year == year
            )
            .all()
        )
    
    def get_public_tasks_by_week(
        self, db: Session, *, week_number: int, year: int
    ) -> List[Task]:
        return (
            db.query(Task)
            .filter(
                Task.is_public == True,
                Task.week_number == week_number,
                Task.year == year
            )
            .all()
        )
    
    def get_tasks_by_date_range(
        self, db: Session, *, owner_id: int, start_date: datetime, end_date: datetime
    ) -> List[Task]:
        # This is a simplified version. In a real app, you'd need to convert
        # between dates and week numbers more carefully
        return (
            db.query(Task)
            .filter(
                Task.owner_id == owner_id,
                Task.created_at >= start_date,
                Task.created_at <= end_date
            )
            .all()
        )


task = CRUDTask(Task) 