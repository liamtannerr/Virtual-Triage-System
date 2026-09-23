from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import List
from .Department import Department

class TicketModel(BaseModel):
    model_config = ConfigDict(extra='forbid', str_max_length=2000)


class generalSymptoms( TicketModel ):
    fever: bool
    chills: bool
    fatigue: bool
    weakness: bool
    weightChange: bool
    nightSweats: bool

class respiratorySymptoms( TicketModel ):
    cough: bool
    shortnessOfBreath: bool
    wheezing: bool
    soreThroat: bool
    nasalCongestion: bool
    chestPain: bool

class gastrointestinalSymptoms( TicketModel ):
    nausea: bool
    vomiting: bool
    diarrhea: bool
    constipation: bool
    abdominalPain: bool
    appetiteLoss: bool

class neurologicalSymptoms( TicketModel ):
    headache: bool
    dizziness: bool
    numbness: bool
    confusion: bool
    memoryLoss: bool
    seizures: bool

class musculoskeletalSymptoms( TicketModel ):
    jointPain: bool
    musclePain: bool
    stiffness: bool
    backPain: bool

class cardiovascularSymptoms( TicketModel ):
    palpitations: bool
    swellinglegsAnkles: bool
    chestPain: bool
    acceleratedHeartbeat: bool

class skinSymptoms( TicketModel ):
    rash: bool
    itching: bool
    bruising: bool
    wounds: bool

class psychologicalSymptoms( TicketModel ):
    anxiety: bool
    depression: bool
    moodSwings: bool
    sleepPatternChanges: bool

class substanceHabits( TicketModel ):
    alcohol: bool
    smoking: bool
    drugs: bool

class VTTicket( TicketModel ):
    ticketID: int = Field(default=0, ge=0)
    email: str = ''
    patient: str = ''
    ED: int
    durationOfSymptoms: str
    listAllergies: str
    pastMedicalConditions: str
    generalSymptoms: generalSymptoms
    respiratorySymptoms: respiratorySymptoms
    gastrointestinalSymptoms: gastrointestinalSymptoms
    neurologicalSymptoms: neurologicalSymptoms
    musculoskeletalSymptoms: musculoskeletalSymptoms
    cardiovascularSymptoms: cardiovascularSymptoms
    skinSymptoms: skinSymptoms
    psychologicalSymptoms: psychologicalSymptoms
    substanceHabits: substanceHabits
    consent: bool
    timestamp: datetime = Field(default_factory=datetime.now)
