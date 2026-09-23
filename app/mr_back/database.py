from pymongo import MongoClient

from config import get_settings


def connect_database():
    settings = get_settings()
    client = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000, tz_aware=True)
    return client, client[settings.mongodb_database]


def initialize_database(db):
    db.users.create_index('email', unique=True)
    db.sessions.create_index('expires_at', expireAfterSeconds=0)
    db.sessions.create_index('user_id')
    db.rate_limits.create_index('expires_at', expireAfterSeconds=0)
    db.VTTickets.create_index('ticketID', unique=True)
    db.VTTickets.create_index('email', unique=True)
    db.medicalTickets.create_index('VTticketID', unique=True)
    db.medicalTickets.create_index('VTTicket.email', unique=True)
    db.emergencyDepartments.create_index('establishmentID', unique=True)
