from fastapi import APIRouter
from services.department_service import get_all_departments, increment_department_load
from typing import List
from models.Department import Department
from pydantic import BaseModel

router = APIRouter()

class IncrementRequest(BaseModel):
    increment: int

@router.get("/department", response_model=List[Department])
async def fetch_departments():
    return await get_all_departments()


@router.put("/department/{department_id}/currentLoad")
async def update_department_load(department_id: int, request: IncrementRequest):
    return await increment_department_load(department_id, request.increment)