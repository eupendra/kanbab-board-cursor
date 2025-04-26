from datetime import datetime, timedelta
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/weekly/{week_number}/{year}", response_model=schemas.TaskExport)
def export_weekly(
    *,
    db: Session = Depends(deps.get_db),
    week_number: int,
    year: int,
    current_user: models.user.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Export tasks for a specific week.
    """
    # Calculate start and end dates for the week
    # This is a simplified calculation and might need adjustment
    start_date = datetime.strptime(f"{year}-W{week_number}-1", "%Y-W%W-%w")
    end_date = start_date + timedelta(days=6)
    
    tasks = crud.task.get_tasks_by_week(
        db=db, owner_id=current_user.id, week_number=week_number, year=year
    )
    
    return {
        "tasks": tasks,
        "start_date": start_date,
        "end_date": end_date,
        "user_name": current_user.full_name,
        "user_email": current_user.email,
    }


@router.get("/monthly/{month}/{year}", response_model=schemas.TaskExport)
def export_monthly(
    *,
    db: Session = Depends(deps.get_db),
    month: int,
    year: int,
    current_user: models.user.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Export tasks for a specific month.
    """
    # Calculate start and end dates for the month
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = datetime(year, month + 1, 1) - timedelta(days=1)
    
    tasks = crud.task.get_tasks_by_date_range(
        db=db, owner_id=current_user.id, start_date=start_date, end_date=end_date
    )
    
    return {
        "tasks": tasks,
        "start_date": start_date,
        "end_date": end_date,
        "user_name": current_user.full_name,
        "user_email": current_user.email,
    }


@router.get("/quarterly/{quarter}/{year}", response_model=schemas.TaskExport)
def export_quarterly(
    *,
    db: Session = Depends(deps.get_db),
    quarter: int,
    year: int,
    current_user: models.user.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Export tasks for a specific quarter.
    """
    if quarter < 1 or quarter > 4:
        raise HTTPException(status_code=400, detail="Quarter must be between 1 and 4")
    
    # Calculate start and end dates for the quarter
    start_month = (quarter - 1) * 3 + 1
    start_date = datetime(year, start_month, 1)
    
    if quarter == 4:
        end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = datetime(year, start_month + 3, 1) - timedelta(days=1)
    
    tasks = crud.task.get_tasks_by_date_range(
        db=db, owner_id=current_user.id, start_date=start_date, end_date=end_date
    )
    
    return {
        "tasks": tasks,
        "start_date": start_date,
        "end_date": end_date,
        "user_name": current_user.full_name,
        "user_email": current_user.email,
    }


@router.get("/yearly/{year}", response_model=schemas.TaskExport)
def export_yearly(
    *,
    db: Session = Depends(deps.get_db),
    year: int,
    current_user: models.user.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Export tasks for a specific year.
    """
    # Calculate start and end dates for the year
    start_date = datetime(year, 1, 1)
    end_date = datetime(year, 12, 31)
    
    tasks = crud.task.get_tasks_by_date_range(
        db=db, owner_id=current_user.id, start_date=start_date, end_date=end_date
    )
    
    return {
        "tasks": tasks,
        "start_date": start_date,
        "end_date": end_date,
        "user_name": current_user.full_name,
        "user_email": current_user.email,
    } 