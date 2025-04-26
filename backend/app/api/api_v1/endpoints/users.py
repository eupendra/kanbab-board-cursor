from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic import EmailStr
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Retrieve users.
    """
    users = crud.user.get_multi(db, skip=skip, limit=limit)
    return users


# Duplicate endpoint without trailing slash to handle both cases
@router.get("", response_model=List[schemas.User])
def read_users_no_slash(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Retrieve users (no trailing slash).
    """
    return read_users(db=db, skip=skip, limit=limit, current_user=current_user)


@router.post("/", response_model=schemas.User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Create new user.
    """
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.user.create(db, obj_in=user_in)
    return user


# Duplicate endpoint with trailing slash to handle both cases
@router.post("", response_model=schemas.User)
def create_user_no_slash(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Create new user (no trailing slash).
    """
    return create_user(db=db, user_in=user_in, current_user=current_user)


@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    password: str = Body(None),
    full_name: str = Body(None),
    email: EmailStr = Body(None),
    current_user: models.user.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    current_user_data = jsonable_encoder(current_user)
    user_in = schemas.UserUpdate(**current_user_data)
    if password is not None:
        user_in.password = password
    if full_name is not None:
        user_in.full_name = full_name
    if email is not None:
        user_in.email = email
    user = crud.user.update(db, db_obj=current_user, obj_in=user_in)
    return user


@router.get("/me", response_model=schemas.User)
def read_user_me(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(
    user_id: int,
    current_user: models.user.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = crud.user.get(db, id=user_id)
    if user == current_user:
        return user
    if not crud.user.is_admin(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return user


@router.get("/{user_id}/", response_model=schemas.User)
def read_user_by_id_with_slash(
    user_id: int,
    current_user: models.user.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific user by id (with trailing slash).
    """
    return read_user_by_id(user_id=user_id, current_user=current_user, db=db)


@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: schemas.UserUpdate,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Update a user.
    """
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    user = crud.user.update(db, db_obj=user, obj_in=user_in)
    return user


@router.put("/{user_id}/", response_model=schemas.User)
def update_user_with_slash(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: schemas.UserUpdate,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Update a user (with trailing slash).
    """
    return update_user(db=db, user_id=user_id, user_in=user_in, current_user=current_user)


@router.delete("/{user_id}", response_model=schemas.User)
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Delete a user.
    """
    try:
        user = crud.user.get(db, id=user_id)
        if not user:
            raise HTTPException(
                status_code=404,
                detail="The user with this id does not exist in the system",
            )
        # Prevent deleting yourself
        if user.id == current_user.id:
            raise HTTPException(
                status_code=400,
                detail="You cannot delete your own user account",
            )
        
        # Create a copy of the user data for the response
        user_data = {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "is_manager": user.is_manager,
        }
        
        # Use raw SQL to delete tasks and user
        db.execute("DELETE FROM task WHERE owner_id = :user_id", {"user_id": user_id})
        db.execute("DELETE FROM user WHERE id = :user_id", {"user_id": user_id})
        db.commit()
        
        # Return the user data as a User model
        return schemas.User(**user_data)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")


@router.delete("/{user_id}/", response_model=schemas.User)
def delete_user_with_slash(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Delete a user (with trailing slash).
    """
    return delete_user(db=db, user_id=user_id, current_user=current_user)


@router.put("/me/", response_model=schemas.User)
def update_user_me_with_slash(
    *,
    db: Session = Depends(deps.get_db),
    password: str = Body(None),
    full_name: str = Body(None),
    email: EmailStr = Body(None),
    current_user: models.user.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user (with trailing slash).
    """
    return update_user_me(db=db, password=password, full_name=full_name, email=email, current_user=current_user) 