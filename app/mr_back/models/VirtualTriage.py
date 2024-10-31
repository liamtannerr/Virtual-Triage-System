from pydantic import BaseModel
from typing import List

class VTTicket( BaseModel ):
    ticketID: int
    userID: int
    ED: object
    description: object

class VTQueue( BaseModel ):
    queue: List[ VTTicket ]