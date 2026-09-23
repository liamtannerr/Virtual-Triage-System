from datetime import datetime, timezone

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError


def create_med_service(db, ticket):
    source = db.VTTickets.find_one({'ticketID': ticket.VTticketID}, {'_id': 0})
    if not source:
        raise HTTPException(404, 'Triage ticket not found')
    # Never trust patient records supplied by the client, even for staff.
    data = {'VTticketID': source['ticketID'], 'priority': ticket.priority,
            'startTime': datetime.now(timezone.utc).isoformat(), 'VTTicket': source}
    try:
        db.medicalTickets.insert_one(data)
    except DuplicateKeyError:
        raise HTTPException(409, 'Medical ticket already exists')
    data.pop('_id', None)
    return data


def get_mt_service(db, user):
    query = {'VTTicket.email': user['email']} if user['user_type'] == 1 else {}
    return list(db.medicalTickets.find(query, {'_id': 0}).sort([('priority', 1), ('startTime', 1)]))


def queue_position(db, user):
    # Return only an aggregate position; other patients' records never reach the browser.
    tickets = db.medicalTickets.find({}, {'VTTicket.email': 1}).sort([('priority', 1), ('startTime', 1)])
    for position, ticket in enumerate(tickets, 1):
        if ticket['VTTicket']['email'] == user['email']:
            return {'position': position}
    return {'position': None}


def delete_ticket(db, ticket_id):
    if not db.medicalTickets.delete_one({'VTticketID': ticket_id}).deleted_count:
        raise HTTPException(404, 'Ticket not found')
    return {'message': 'Ticket deleted successfully'}
