def get_all_departments(db):
    return list(db.emergencyDepartments.find({}, {'_id': 0}))
