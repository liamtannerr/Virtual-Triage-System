from pymongo import MongoClient
from models.Medical import MedicalTicket
from fastapi import HTTPException, status

# MongoDB connection
uri = 'mongodb+srv://admin:admin@mrcluster.lrupm.mongodb.net/'
client = MongoClient(uri)
db = client['mr_data']
ticket_collection = db['medicalTickets']
user_collection = db['users']

async def create_med_service( medTicket: MedicalTicket ) -> MedicalTicket:

    existing_ticket = ticket_collection.find_one(
        { 'VTticketID': medTicket.VTticketID }
    )
    if existing_ticket == None:
        raise HTTPException( status_code = status.HTTP_400_BAD_REQUEST, detail = "Ticket already exists" )
    
    ticketDict = medTicket.dict()
    ticket_collection.insert_one( ticketDict )
    return medTicket