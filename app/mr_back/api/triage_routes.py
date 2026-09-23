from fastapi import APIRouter, Depends, Request
from models.VirtualTriage import VTTicket
from security import current_user, require_roles
from services import triage_service as service

router = APIRouter()


@router.get('/tickets', response_model=list[VTTicket])
def get_all_tickets(request: Request, user=Depends(current_user)):
    return service.get_tickets(request.app.state.db, user)


@router.post('/tickets', response_model=VTTicket)
def create_new_ticket(ticket: VTTicket, request: Request, user=Depends(require_roles(1))):
    return service.create_ticket(request.app.state.db, user, ticket)


@router.put('/tickets/{ticket_id}', response_model=VTTicket)
def update_existing_ticket(ticket_id: int, ticket: VTTicket, request: Request, user=Depends(require_roles(2))):
    return service.update_ticket(request.app.state.db, ticket_id, ticket)


@router.delete('/tickets/{ticket_id}')
def delete_existing_ticket(ticket_id: int, request: Request, user=Depends(require_roles(2))):
    return service.delete_ticket(request.app.state.db, ticket_id)
