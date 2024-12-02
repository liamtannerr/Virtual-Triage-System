from pymongo import MongoClient

# MongoDB connection
uri = 'mongodb+srv://admin:admin@mrcluster.lrupm.mongodb.net/'
client = MongoClient(uri)
db = client['mr_data']
Department_collection = db['emergencyDepartments']

# Print all departments
for department in Department_collection.find():
    print(department)