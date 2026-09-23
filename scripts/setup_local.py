"""Create local secrets once, without displaying or overwriting them."""
from pathlib import Path
import os
import secrets

root = Path(__file__).resolve().parents[1]
targets = [root / '.env', root / 'app/mr_back/.env']
if any(path.exists() for path in targets):
    raise SystemExit('Configuration already exists. Refusing to overwrite database credentials.')
app_password = secrets.token_hex(32)
values = [
    f'MONGO_ROOT_PASSWORD={secrets.token_hex(32)}\nMONGO_APP_PASSWORD={app_password}\n',
    'APP_ENV=development\n'
    f'MONGODB_URI=mongodb://triage_app:{app_password}@127.0.0.1:27017/virtual_triage?authSource=virtual_triage\n'
    'MONGODB_DATABASE=virtual_triage\n'
    'ALLOWED_ORIGINS=["http://localhost:3000"]\n'
    'ALLOWED_HOSTS=["localhost","127.0.0.1"]\n'
    'SESSION_MINUTES=60\n',
]
for path, value in zip(targets, values):
    with os.fdopen(os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'w') as output:
        output.write(value)
print('Created ignored local configuration with generated database credentials.')
