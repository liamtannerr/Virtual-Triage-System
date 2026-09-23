from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List
from .VirtualTriage import VTTicket


class MedicalTicket( BaseModel ):
    model_config = ConfigDict(extra='forbid')
    VTticketID: int
    priority: int = Field(ge=1, le=9)
    startTime: datetime
    VTTicket: VTTicket
