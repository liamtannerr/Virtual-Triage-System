from pydantic import BaseModel
from datetime import datetime
from typing import List
from .VirtualTriage import VTTicket


class MedicalTicket( BaseModel ):
    VTticketID: int
    priority: int
    startTime: str
    VTTicket: VTTicket