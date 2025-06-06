from pymongo import MongoClient
from models.Medical import MedicalTicket
from fastapi import HTTPException, status
from typing import List

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
    if existing_ticket:
        raise HTTPException( status_code = status.HTTP_400_BAD_REQUEST, detail = "Ticket already exists" )
    
    ticketDict = medTicket.dict()
    ticket_collection.insert_one( ticketDict )
    return medTicket

async def get_mt_service() -> List[MedicalTicket]:
    try:
        tickets = list(ticket_collection.find({}, {'_id': 0}).sort("priority", 1))
        return tickets
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
async def delete_ticket(ticket_id: int) -> dict:
    try:
        result = ticket_collection.delete_one({"VTticketID": ticket_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
        return {"message": "Ticket deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

