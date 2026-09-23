from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict
from models.Department import Department
from security import require_roles
from services.department_service import get_all_departments, increment_department_load

router = APIRouter()


class IncrementRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    increment: Literal[-1, 1]


@router.get('/department', response_model=list[Department])
def fetch_departments(request: Request):
    return get_all_departments(request.app.state.db)


@router.put('/department/{department_id}/currentLoad')
def update_department_load(department_id: int, data: IncrementRequest, request: Request, user=Depends(require_roles(2, 3))):
    if (user['user_type'] == 2 and data.increment != 1) or (user['user_type'] == 3 and data.increment != -1):
        raise HTTPException(403, 'This load change is not permitted')
    return increment_department_load(request.app.state.db, department_id, data.increment)
