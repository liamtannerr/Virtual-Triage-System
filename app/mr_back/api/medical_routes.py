from fastapi import APIRouter, Depends, Request
from models.Medical import MedicalTicket
from security import current_user, require_roles
from services import medical_service as service
from services import workflow_service

router = APIRouter()


@router.get('/tickets', response_model=list[MedicalTicket])
def get_medical_tickets(request: Request, user=Depends(current_user)):
    return service.get_mt_service(request.app.state.db, user)


@router.get('/position')
def get_position(request: Request, user=Depends(require_roles(1))):
    return service.queue_position(request.app.state.db, user)


@router.post('/tickets/{ticket_id}/call')
def call(ticket_id: int, request: Request, user=Depends(require_roles(3))):
    return workflow_service.call_patient(request.app.state.db, ticket_id)
