"""Start the hosted demo on Render; local development still uses uvicorn directly."""
import json
import os
from pathlib import Path
import subprocess
import sys


def main():
    if os.environ.get('APP_ENV') != 'production':
        raise SystemExit('Render startup requires APP_ENV=production.')
    if not os.environ.get('ALLOWED_HOSTS'):
        hostname = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
        if not hostname:
            raise SystemExit('Set ALLOWED_HOSTS or run this service on Render.')
        os.environ['ALLOWED_HOSTS'] = json.dumps([hostname])

    os.chdir(Path(__file__).resolve().parent)
    # Idempotent: creates missing fictional departments; never resets queue loads.
    # Free Render services do not offer a shell or pre-deploy commands.
    subprocess.run([sys.executable, 'manage.py', 'seed-demo'], check=True)
    os.execv(sys.executable, [
        sys.executable, '-m', 'uvicorn', 'main:app',
        '--host', '0.0.0.0', '--port', os.environ.get('PORT', '10000'),
        '--workers', '1', '--no-proxy-headers',
    ])


if __name__ == '__main__':
    main()
