from pymongo import MongoClient
from fastapi import HTTPException, status
from models.Department import Department
from typing import List
from bson import ObjectId

# MongoDB connection
uri = 'mongodb+srv://admin:admin@mrcluster.lrupm.mongodb.net/'
client = MongoClient(uri)
db = client['mr_data']
Department_collection = db['emergencyDepartments']
user_collection = db['users']

from bson import ObjectId

async def get_all_departments():
    departments = []
    for department in Department_collection.find():
        # Transform the MongoDB document into the Pydantic model format
        transformed_department = {
            "establishmentID": department.get("establishmentID", None) or department["_id"],  # Ensure an int
            "name": department["name"],
            "currentLoad": department["currentLoad"],
            "address": department["address"],  # Include address if available
        }

        # Convert the ObjectId _id to an integer (or fallback to None if this fails)
        if isinstance(transformed_department["establishmentID"], ObjectId):
            transformed_department["establishmentID"] = int(str(transformed_department["establishmentID"])[:6], 16)  # Use part of ObjectId for int
        
        departments.append(Department(**transformed_department))
    return departments


async def increment_department_load(department_id: int, increment: int):
    department = Department_collection.find_one({"establishmentId": department_id})
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    new_load = department["currentLoad"] + increment
    result = Department_collection.update_one(
        {"establishmentId": department_id},
        {"$set": {"currentLoad": new_load}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update department load")

    return {"message": "Department load updated", "currentLoad": new_load}