from fastapi import APIRouter

from app.api.api_v1.endpoints import login, users, tasks, exports

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(exports.router, prefix="/exports", tags=["exports"]) 