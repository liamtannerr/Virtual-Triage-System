from pydantic import BaseModel
from datetime import time
from typing import List
from VirtualTriage import VTTicket


class MedicalTicket( BaseModel ):
    ticket: VTTicket
    priority: int
    startTime: time

class MedicalQueue( BaseModel ):
    queue: List[ MedicalTicket ]