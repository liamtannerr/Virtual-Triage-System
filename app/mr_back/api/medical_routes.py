from fastapi import APIRouter, Depends
from models.Medical import MedicalTicket
from services.medical_service import create_med_service, get_mt_service
from fastapi.security import HTTPBearer
from typing import List

router = APIRouter()

@router.post("/ticket")
async def create_med_ticket(med_ticket: MedicalTicket):
    return await create_med_service(med_ticket)

@router.get("/tickets", response_model=List[MedicalTicket])
async def get_medical_tickets():
    return await get_mt_service()

