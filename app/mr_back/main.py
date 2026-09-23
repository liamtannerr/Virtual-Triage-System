from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError, ResponseValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.responses import JSONResponse
from pymongo.errors import PyMongoError

from api.auth_routes import router as auth_router
from api.triage_routes import router as triage_router
from api.medical_routes import router as medical_router
from api.department_routes import router as department_router
from config import get_settings
from database import connect_database, initialize_database


@asynccontextmanager
async def lifespan(app):
    client, db = connect_database()
    try:
        try:
            client.admin.command('ping')
            initialize_database(db)
        except PyMongoError:
            raise RuntimeError('MongoDB initialization failed. Check backend configuration and database availability.') from None
        app.state.db = db
        yield
    finally:
        client.close()


class RequestGuard:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http':
            return await self.app(scope, receive, send)
        headers = dict(scope['headers'])
        if scope['method'] not in ('GET', 'HEAD', 'OPTIONS'):
            # Browser-controlled Origin blocks CSRF, including login CSRF.
            if headers.get(b'origin', b'').decode() not in get_settings().allowed_origins:
                return await JSONResponse({'detail': 'Untrusted request origin'}, status_code=403)(scope, receive, send)
        body = bytearray()
        while True:
            message = await receive()
            if message['type'] == 'http.disconnect':
                return
            body.extend(message.get('body', b''))
            if len(body) > 65536:
                return await JSONResponse({'detail': 'Request too large'}, status_code=413)(scope, receive, send)
            if not message.get('more_body', False):
                break
        delivered = False

        async def replay():
            nonlocal delivered
            if not delivered:
                delivered = True
                return {'type': 'http.request', 'body': bytes(body), 'more_body': False}
            return await receive()

        await self.app(scope, replay, send)


def create_app():
    settings = get_settings()
    app = FastAPI(lifespan=lifespan, docs_url='/docs' if settings.app_env == 'development' else None,
                  redoc_url=None, openapi_url='/openapi.json' if settings.app_env == 'development' else None)
    app.add_middleware(RequestGuard)
    app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins,
                       allow_credentials=True, allow_methods=['GET', 'POST', 'PUT', 'DELETE'],
                       allow_headers=['Content-Type'])
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)

    @app.middleware('http')
    async def security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers['Cache-Control'] = 'no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Referrer-Policy'] = 'no-referrer'
        if settings.app_env == 'production':
            response.headers['Strict-Transport-Security'] = 'max-age=31536000'
        return response

    @app.exception_handler(RequestValidationError)
    async def validation_error(request, exc):
        # Pydantic's default response includes submitted values (including passwords).
        return JSONResponse({'detail': 'Invalid request data'}, status_code=422)

    @app.exception_handler(ResponseValidationError)
    async def invalid_stored_record(request, exc):
        logging.getLogger(__name__).error('Stored record failed response validation')
        return JSONResponse({'detail': 'Unable to return this record'}, status_code=500)

    @app.exception_handler(PyMongoError)
    async def database_error(request, exc):
        logging.getLogger(__name__).error('Database operation failed: %s', type(exc).__name__)
        return JSONResponse({'detail': 'Database temporarily unavailable'}, status_code=503)

    app.include_router(auth_router, prefix='/auth')
    app.include_router(triage_router, prefix='/triage')
    app.include_router(medical_router, prefix='/medical')
    app.include_router(department_router, prefix='/emergency')

    @app.get('/')
    def homepage():
        return {'message': 'Virtual Triage API'}

    return app


app = create_app()
