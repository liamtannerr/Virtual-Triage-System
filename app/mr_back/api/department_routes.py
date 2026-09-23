from fastapi import APIRouter, Request
from models.Department import Department
from services.department_service import get_all_departments

router = APIRouter()


@router.get('/department', response_model=list[Department])
def fetch_departments(request: Request):
    return get_all_departments(request.app.state.db)
