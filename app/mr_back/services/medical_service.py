from pymongo import MongoClient
from models.Medical import MedicalTicket
from fastapi import HTTPException, status

# MongoDB connection
uri = 'mongodb+srv://admin:admin@mrcluster.lrupm.mongodb.net/?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true'
client = MongoClient(uri)
db = client['mr_data']
ticket_collection = db['medicalTickets']

async def create_med_service( medTicket: MedicalTicket ):
    existing_ticket = ticket_collection.find_one(
        { 'VTticketID': medTicket.VTticketID }
    )

    if existing_ticket:
        raise HTTPException( status_code = status.HTTP_400_BAD_REQUEST, detail = "Ticket already exists" )
    
    ticketDict = medTicket.dict()
    ticket_collection.insert_one( ticketDict )
    return medTicket