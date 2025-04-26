import logging
from sqlalchemy.orm import Session

from app import crud, schemas
from app.core.config import settings
from app.db import base  # noqa: F401
from app.db.session import engine

# make sure all SQL Alchemy models are imported (app.db.base) before initializing DB
# otherwise, SQL Alchemy might fail to initialize relationships properly

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db(db: Session) -> None:
    # Create tables
    base.Base.metadata.create_all(bind=engine)
    
    # Create initial admin user if it doesn't exist
    user = crud.user.get_by_email(db, email="admin@example.com")
    if not user:
        user_in = schemas.UserCreate(
            email="admin@example.com",
            password="admin",
            full_name="Initial Admin",
            is_admin=True,
            is_manager=True,
        )
        user = crud.user.create(db, obj_in=user_in)
        logger.info("Initial admin user created")


def main() -> None:
    logger.info("Creating initial data")
    from app.db.session import SessionLocal
    db = SessionLocal()
    init_db(db)
    logger.info("Initial data created")


if __name__ == "__main__":
    main() 