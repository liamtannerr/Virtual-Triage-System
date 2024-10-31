from pydantic import BaseModel

class Department:
    establishmentID: int
    address: str
    maximumCapacity: int
    currentLoad: int
    name: str