# Fresh MongoDB setup and security changes

This branch starts with a new database. It does not connect to, copy, or migrate the school's old MongoDB instance. Use fictional records while developing this educational project.

## Local development

Prerequisites: Docker Compose, Python 3.11+, and Node.js 20+ (a supported Node LTS release is recommended).

From the repository root:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade 'pip>=26.2'
.venv/bin/pip install -r app/mr_back/requirements-dev.txt
python3 scripts/setup_local.py
docker compose up -d --wait
.venv/bin/python app/mr_back/manage.py seed-demo
```

`setup_local.py` creates `.env` and `app/mr_back/.env` with random credentials and file mode `0600`. Both are ignored by Git. It refuses to overwrite existing configuration. If configuration was already generated during this security update, skip that command.

MongoDB listens only on `127.0.0.1:27017`. The Compose project `virtual-triage-fresh` has its own `fresh_mongodb` volume. The API uses `triage_app`, which has `readWrite` permission only on `virtual_triage`; the root credential is used only to initialize MongoDB. Editing an environment file does not change credentials inside an existing MongoDB volume.

Start the backend in one terminal, from the repository root:

```sh
cd app/mr_back
../../.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --reload --no-proxy-headers
```

Start the frontend in another terminal:

```sh
cd app/mr_ed
npm ci
npm start
```

Open **http://localhost:3000**. Use that exact hostname; cookies and allowed origins distinguish `localhost` from `127.0.0.1`. The frontend sends requests to `/api`; Vite proxies them to `http://127.0.0.1:8000` during development. This keeps browser requests on one origin and avoids IPv4/IPv6 localhost ambiguity. Override the public API path with `VITE_API_URL` in `app/mr_ed/.env.local` if necessary. Only public frontend configuration belongs in variables prefixed with `VITE_`.

Register a patient using a password of 15–128 characters. The seed command creates two fictional departments, no patient records and no default accounts. Staff accounts must be created using the local administrator CLI:

```sh
.venv/bin/python app/mr_back/manage.py create-staff --email nurse@example.com --name 'Demo Nurse' --role nurse
.venv/bin/python app/mr_back/manage.py create-staff --email doctor@example.com --name 'Demo Doctor' --role doctor
```

Passwords are prompted privately. These commands are run from the repository root. Staff have system-wide access in this application's single organization; there is no hospital/tenant scoping model.

## Implemented controls

- Passwords use Argon2id. Passwords and hashes are excluded from API responses and validation errors. There is no plaintext password migration or fallback.
- Random 256-bit opaque sessions replace JWTs. MongoDB stores only SHA-256 digests, and every request checks expiration and the user's current role/disabled status. Default lifetime: 60 minutes. Logout deletes the session. Signing secrets are no longer needed.
- Session cookies are HttpOnly and SameSite=Strict. Production additionally uses Secure and the `__Host-` cookie prefix. JavaScript stores only display hints; protected screens fetch the authenticated profile before rendering.
- Every write requires an exact configured Origin, including login, registration and logout. This blocks browser CSRF. Non-browser clients must also supply a trusted Origin and their authenticated cookie.
- Login and registration share a MongoDB-backed limit of 20 attempts per source IP per 15-minute window. TTL records expire automatically. Behind a reverse proxy, configure Uvicorn to trust forwarding headers only from the actual proxy. Do not trust arbitrary forwarded IPs. This baseline limit is not a substitute for deployment-level abuse monitoring.
- Public registration can create only patients. Roles and initial triage state cannot be elevated through registration.
- Patients see only their own triage/medical tickets. Queue position is returned as an aggregate without other patients' details. The server supplies ticket IDs, patient identity, and submission timestamps.
- Nurses can review/edit/remove triage tickets and create medical tickets. Doctors can call patients and remove medical tickets. Medical records are copied from the stored triage record, not a supplied client record. Department load changes require the appropriate staff role and cannot go below zero.
- Patient status changes are restricted to their own acknowledgement of a doctor call or rejection. Staff status changes require an existing corresponding patient ticket.
- MongoDB connections are centralized and validated. Remote/production connections require TLS and cannot disable certificate/hostname verification. Only local development permits MongoDB without TLS.
- Unique indexes protect emails and active tickets. HTTP payloads are limited to 64 KiB. Request validation and database errors do not echo secrets or patient input. API responses use `Cache-Control: no-store` and security headers.
- Frontend dependencies use Vite instead of the obsolete Create React App toolchain. Unused Next.js and other unused build dependencies were removed. `npm run build` still outputs `app/mr_ed/build`.

To revoke all sessions for an account:

```sh
.venv/bin/python app/mr_back/manage.py revoke-sessions --email patient@example.com
```

There is no public password recovery/email verification flow yet. Staff provisioning remains an administrative task. Queue transitions still span multiple database operations: failures may require staff reconciliation; this change does not introduce transactional clinical workflows.

## Fresh Atlas instance for later deployment

The local database created by Compose is not a hosted Atlas instance. Create a **new** Atlas cluster/project for deployment, create a database user scoped to `readWrite` on `virtual_triage`, and allow only the backend's network source. Get the Python connection string from Atlas's Connect dialog. Do not reuse the old URI or credentials.

Configure the backend's deployment secrets/settings:

```dotenv
APP_ENV=production
MONGODB_URI=mongodb+srv://NEW_USER:URL_ENCODED_PASSWORD@NEW_CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=virtual_triage
ALLOWED_ORIGINS=["https://triage.example.com"]
ALLOWED_HOSTS=["triage.example.com"]
SESSION_MINUTES=60
```

Serve the frontend and API over HTTPS on the same site, preferably with `/api` proxied to FastAPI and the `/api` prefix stripped. Vite production builds default to `/api`; for an API on a sibling HTTPS subdomain set `VITE_API_URL` at build time and include its hostname in `ALLOWED_HOSTS`. SameSite=Strict cookies intentionally will not work across unrelated hosting domains.

The proxy must terminate HTTPS, preserve Host/Origin, forward only trusted client IP information, limit request size, and serve the SPA's `index.html` for frontend routes. Set frontend security headers at the hosting layer; the API's headers do not cover static frontend responses. Production API documentation endpoints are disabled. Do not expose development servers to the internet.

Atlas setup reference: https://www.mongodb.com/docs/atlas/connect-to-database-deployment/
Password hashing reference: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
TLS reference: https://www.mongodb.com/docs/languages/python/pymongo-driver/current/security/tls/

## Validation

From the repository root:

```sh
.venv/bin/pytest -q app/mr_back/tests
.venv/bin/python app/mr_back/debug_db.py
.venv/bin/python scripts/smoke_test.py
```

Unit tests use isolated in-memory MongoDB substitutes and never access Atlas. The smoke test uses the configured database, creates randomly named fictional test accounts, exercises the patient/nurse/doctor workflow, and deletes only its own records afterward. Seed demo departments before running it. It leaves short-lived authentication rate-limit records for automatic TTL cleanup.

Frontend checks:

```sh
cd app/mr_ed
npm test
npm run build
npm audit
```

This work has not deployed the app or established readiness for real patient use. The repository's educational-use restriction still applies.
