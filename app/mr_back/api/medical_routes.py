from fastapi import APIRouter, Depends
from models.Medical import MedicalTicket
from services.medical_service import create_med_service
from fastapi.security import HTTPBearer

router = APIRouter()
security = HTTPBearer()

@router.post("/ticket")
async def create_med_ticket(med_ticket: MedicalTicket):
    return await create_med_service(med_ticket)
