from functools import lru_cache
from pathlib import Path
from typing import Literal
from urllib.parse import parse_qs, urlsplit

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=Path(__file__).with_name('.env'), extra='ignore', hide_input_in_errors=True)
    app_env: Literal['development', 'production'] = 'development'
    mongodb_uri: str = Field(repr=False)
    mongodb_database: str = 'virtual_triage'
    allowed_origins: list[str] = ['http://localhost:3000']
    allowed_hosts: list[str] = ['localhost', '127.0.0.1']
    session_minutes: int = Field(default=60, ge=5, le=1440)

    @model_validator(mode='after')
    def validate_security(self):
        uri = urlsplit(self.mongodb_uri)
        options = {k.lower(): v[-1].lower() for k, v in parse_qs(uri.query).items()}
        if uri.scheme not in ('mongodb', 'mongodb+srv') or not uri.hostname:
            raise ValueError('A MongoDB URI is required')
        for option in ('tlsinsecure', 'tlsallowinvalidcertificates', 'tlsallowinvalidhostnames'):
            if options.get(option, 'false') != 'false':
                raise ValueError('MongoDB TLS verification cannot be disabled')
        hosts = uri.netloc.rsplit('@', 1)[-1].split(',')
        local = all(urlsplit('mongodb://' + host).hostname in ('localhost', '127.0.0.1', '::1') for host in hosts)
        if self.app_env == 'production' or not local:
            if options.get('tls') == 'false' or options.get('ssl') == 'false':
                raise ValueError('Remote MongoDB requires TLS')
            if uri.scheme != 'mongodb+srv' and options.get('tls') != 'true':
                raise ValueError('Remote MongoDB requires TLS')
        if not self.allowed_hosts or any('*' in host for host in self.allowed_hosts):
            raise ValueError('Explicit allowed hosts are required')
        if not self.allowed_origins:
            raise ValueError('Explicit allowed origins are required')
        for origin in self.allowed_origins:
            parsed = urlsplit(origin)
            if parsed.scheme not in ('http', 'https') or not parsed.hostname or '*' in origin or parsed.path or parsed.query or parsed.fragment or parsed.username:
                raise ValueError('Allowed origins must be exact HTTP(S) origins without a trailing slash')
            if self.app_env == 'production' and parsed.scheme != 'https':
                raise ValueError('Production origins require HTTPS')
        return self

    @property
    def cookie_name(self):
        return '__Host-triage_session' if self.app_env == 'production' else 'triage_session'


@lru_cache
def get_settings():
    return Settings()
