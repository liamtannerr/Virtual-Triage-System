import secrets
from datetime import datetime, timezone

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError


def get_tickets(db, user):
    query = {'email': user['email']} if user['user_type'] == 1 else {}
    return list(db.VTTickets.find(query, {'_id': 0}))


def create_ticket(db, user, ticket):
    if not ticket.consent:
        raise HTTPException(422, 'Consent is required')
    if not db.emergencyDepartments.find_one({'establishmentID': ticket.ED}):
        raise HTTPException(422, 'Unknown emergency department')
    if user['inTriage'] != 'false' or db.medicalTickets.find_one({'VTTicket.email': user['email']}):
        raise HTTPException(409, 'You already have an active triage')
    data = ticket.model_dump(mode='json')
    # Identity, identifier and submission time are always server-controlled.
    data.update(ticketID=secrets.randbits(52), email=user['email'], patient=user['name'],
                timestamp=datetime.now(timezone.utc).isoformat())
    try:
        db.VTTickets.insert_one(data)
    except DuplicateKeyError:
        raise HTTPException(409, 'You already have an active triage')
    db.users.update_one({'_id': user['_id']}, {'$set': {'inTriage': 'true'}})
    data.pop('_id', None)
    return data


def update_ticket(db, ticket_id, ticket):
    existing = db.VTTickets.find_one({'ticketID': ticket_id})
    if not existing:
        raise HTTPException(404, 'Ticket not found')
    data = ticket.model_dump(mode='json')
    for field in ('ticketID', 'email', 'patient', 'timestamp', 'consent', 'ED'):
        data[field] = existing[field]
    db.VTTickets.update_one({'ticketID': ticket_id}, {'$set': data})
    data.pop('_id', None)
    return data


def delete_ticket(db, ticket_id):
    if not db.VTTickets.delete_one({'ticketID': ticket_id}).deleted_count:
        raise HTTPException(404, 'Ticket not found')
    return {'message': 'Ticket deleted successfully'}
