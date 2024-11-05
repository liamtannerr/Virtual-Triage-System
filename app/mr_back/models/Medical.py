from pydantic import BaseModel
from datetime import datetime
from typing import List


class MedicalTicket( BaseModel ):
    VTticketID: int
    priority: int
    startTime: str