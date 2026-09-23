from fastapi import APIRouter, Depends, Request
from models.Medical import MedicalTicket
from security import current_user, require_roles
from services import medical_service as service

router = APIRouter()


@router.post('/ticket', response_model=MedicalTicket)
def create_med_ticket(ticket: MedicalTicket, request: Request, user=Depends(require_roles(2))):
    return service.create_med_service(request.app.state.db, ticket)


@router.get('/tickets', response_model=list[MedicalTicket])
def get_medical_tickets(request: Request, user=Depends(current_user)):
    return service.get_mt_service(request.app.state.db, user)


@router.get('/position')
def get_position(request: Request, user=Depends(require_roles(1))):
    return service.queue_position(request.app.state.db, user)


@router.delete('/tickets/{ticket_id}')
def delete_existing_ticket(ticket_id: int, request: Request, user=Depends(require_roles(3))):
    return service.delete_ticket(request.app.state.db, ticket_id)
