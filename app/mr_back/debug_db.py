"""Check connectivity without printing patient records or connection credentials."""
from database import connect_database
from pymongo.errors import PyMongoError

if __name__ == '__main__':
    client, db = connect_database()
    try:
        client.admin.command('ping')
        print('MongoDB connection successful.')
    except PyMongoError:
        raise SystemExit('MongoDB connection failed. Check backend configuration and database availability.')
    finally:
        client.close()
