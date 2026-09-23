from fastapi import HTTPException
from pymongo import ReturnDocument


def get_all_departments(db):
    return list(db.emergencyDepartments.find({}, {'_id': 0}))


def increment_department_load(db, department_id, increment):
    query = {'establishmentID': department_id}
    if increment < 0:
        query['currentLoad'] = {'$gte': 1}
    department = db.emergencyDepartments.find_one_and_update(
        query, {'$inc': {'currentLoad': increment}}, return_document=ReturnDocument.AFTER)
    if not department:
        raise HTTPException(409, 'Department not found or load cannot be reduced')
    return {'message': 'Department load updated', 'currentLoad': department['currentLoad']}
