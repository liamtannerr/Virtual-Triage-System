import os
import sys
from pathlib import Path

import mongomock
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ['MONGODB_URI'] = 'mongodb://127.0.0.1:27017'
os.environ['ALLOWED_HOSTS'] = '["testserver", "localhost"]'
os.environ['ALLOWED_ORIGINS'] = '["http://localhost:3000"]'
os.environ['APP_ENV'] = 'development'

from main import create_app
from database import initialize_database


@pytest.fixture
def db():
    database = mongomock.MongoClient(tz_aware=True).test
    initialize_database(database)
    database.emergencyDepartments.insert_one({'establishmentID': 1, 'name': 'Demo', 'address': 'Fictional', 'currentLoad': 0})
    return database


@pytest.fixture
def client(db, monkeypatch):
    # mongomock has no transactions. These tests cover routes/permissions only;
    # scripts/smoke_test.py verifies real transaction commit and rollback.
    from services import workflow_service
    monkeypatch.setattr(workflow_service, 'run_transaction', lambda db, action: action(None))
    app = create_app()
    app.state.db = db
    # No lifespan: security tests use an isolated DB; integration tests cover real startup.
    return TestClient(app, headers={'Origin': 'http://localhost:3000'})
