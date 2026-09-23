from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, ConfigDict, Field
from models.VirtualTriage import VTTicket
from security import current_user, require_roles
from services import triage_service as service
from services import workflow_service

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


class ApproveRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    priority: int = Field(ge=1, le=9, strict=True)


@router.post('/tickets/{ticket_id}/approve')
def approve(ticket_id: int, data: ApproveRequest, request: Request, user=Depends(require_roles(2))):
    return workflow_service.approve_ticket(request.app.state.db, ticket_id, data.priority)


@router.post('/tickets/{ticket_id}/decline')
def decline(ticket_id: int, request: Request, user=Depends(require_roles(2))):
    return workflow_service.decline_ticket(request.app.state.db, ticket_id)
