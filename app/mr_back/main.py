from fastapi import FastAPI
from api.auth_routes import router as auth_router


app = FastAPI()

app.include_router( auth_router, prefix="/auth" )

@app.get( '/' )
def homepage():
    return { 'message': 'Welcome to the homepage' }

