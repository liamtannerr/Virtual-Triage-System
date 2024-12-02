from pydantic import BaseModel

class Department(BaseModel):
    establishmentID: int
    address: str
    name: str
    currentLoad: int