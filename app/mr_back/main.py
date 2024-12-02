from fastapi import FastAPI
from api.auth_routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from api.triage_routes import router as triage_router
from api.medical_routes import router as medical_router
from api.department_routes import router as department_router

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router( auth_router, prefix="/auth" )
app.include_router( triage_router, prefix="/triage")
app.include_router( medical_router, prefix="/medical")
app.include_router(department_router, prefix="/emergency")


@app.get( '/' )
def homepage():
    return { 'message': 'Welcome to the homepage' }

