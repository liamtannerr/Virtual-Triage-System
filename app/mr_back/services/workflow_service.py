"""Staff actions: all database changes commit together, or none do."""
from datetime import datetime, timezone

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError
from pymongo.read_concern import ReadConcern
from pymongo.write_concern import WriteConcern


def run_transaction(db, action):
    # Reuse the application's MongoClient; each action gets its own DB session.
    # PyMongo may rerun action on a write conflict, so it must only do DB work.
    try:
        with db.client.start_session() as session:
            return session.with_transaction(
                action, read_concern=ReadConcern('snapshot'),
                write_concern=WriteConcern('majority'),
            )
    except DuplicateKeyError:
        raise HTTPException(409, 'Ticket already processed. Refresh the queue.')


def approve_ticket(db, ticket_id, priority):
    def action(session):
        source = db.VTTickets.find_one({'ticketID': ticket_id}, {'_id': 0}, session=session)
        if not source:
            raise HTTPException(404, 'Triage ticket no longer available. Refresh the queue.')
        db.medicalTickets.insert_one({
            'VTticketID': source['ticketID'], 'priority': priority,
            'startTime': datetime.now(timezone.utc).isoformat(), 'VTTicket': source,
        }, session=session)
        department = db.emergencyDepartments.update_one(
            {'establishmentID': source['ED']}, {'$inc': {'currentLoad': 1}}, session=session,
        )
        if not department.matched_count:
            raise HTTPException(409, 'Department no longer available.')
        if not db.users.find_one(
            {'email': source['email'], 'user_type': 1, 'inTriage': 'true'}, session=session,
        ):
            raise HTTPException(409, 'Patient status does not match this ticket.')
        db.VTTickets.delete_one({'ticketID': ticket_id}, session=session)
        return {'message': 'Submission approved'}

    return run_transaction(db, action)


def decline_ticket(db, ticket_id):
    def action(session):
        # Removing the source also ensures simultaneous reviews conflict.
        source = db.VTTickets.find_one_and_delete({'ticketID': ticket_id}, session=session)
        if not source:
            raise HTTPException(404, 'Triage ticket no longer available. Refresh the queue.')
        if db.medicalTickets.find_one({'VTTicket.email': source['email']}, session=session):
            raise HTTPException(409, 'Patient already has a medical ticket.')
        patient = db.users.update_one(
            {'email': source['email'], 'user_type': 1, 'inTriage': 'true'},
            {'$set': {'inTriage': 'rejected'}}, session=session,
        )
        if not patient.matched_count:
            raise HTTPException(409, 'Patient status does not match this ticket.')
        return {'message': 'Submission declined'}

    return run_transaction(db, action)


def call_patient(db, ticket_id):
    def action(session):
        medical = db.medicalTickets.find_one_and_delete({'VTticketID': ticket_id}, session=session)
        if not medical:
            raise HTTPException(404, 'Medical ticket no longer available. Refresh the queue.')
        source = medical['VTTicket']
        department = db.emergencyDepartments.update_one(
            {'establishmentID': source['ED'], 'currentLoad': {'$gte': 1}},
            {'$inc': {'currentLoad': -1}}, session=session,
        )
        if not department.matched_count:
            raise HTTPException(409, 'Department missing or queue load is inconsistent.')
        patient = db.users.update_one(
            {'email': source['email'], 'user_type': 1, 'inTriage': 'true'},
            {'$set': {'inTriage': 'doctor'}}, session=session,
        )
        if not patient.matched_count:
            raise HTTPException(409, 'Patient status does not match this ticket.')
        return {'message': 'Patient called'}

    return run_transaction(db, action)
