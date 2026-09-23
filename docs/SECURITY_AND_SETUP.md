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

MongoDB listens only on `127.0.0.1:27017`. The Compose project `virtual-triage-fresh` has its own `fresh_mongodb` volume. The API uses `triage_app`, which has `readWrite` permission only on `virtual_triage`; the root credential stays in the MongoDB container for initialization and replica-set health checks. Editing an environment file does not change credentials inside an existing MongoDB volume.

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
- Nurses can edit, approve, or decline triage tickets. Doctors can call patients. Each staff workflow updates its tickets, patient status, and department load in one transaction. Medical records are copied from the stored triage record; the client sends only a ticket ID and approval priority. Raw ticket deletion, medical creation, and load adjustment endpoints have been removed.
- The user update endpoint only lets patients acknowledge their own doctor call or rejection. Staff update patient status through the workflow endpoints.
- MongoDB connections are centralized and validated. Remote/production connections require TLS and cannot disable certificate/hostname verification. Only local development permits MongoDB without TLS.
- Unique indexes protect emails and active tickets. HTTP payloads are limited to 64 KiB. Request validation and database errors do not echo secrets or patient input. API responses use `Cache-Control: no-store` and security headers.
- Frontend dependencies use Vite instead of the obsolete Create React App toolchain. Unused Next.js and other unused build dependencies were removed. `npm run build` still outputs `app/mr_ed/build`.

To revoke all sessions for an account:

```sh
.venv/bin/python app/mr_back/manage.py revoke-sessions --email patient@example.com
```

There is no public password recovery/email verification flow yet. Staff provisioning remains an administrative task. Staff queue transitions now use transactions; the existing ticket schema and queue ordering are unchanged. Patient intake creation (ticket insertion plus user status update) remains a separate future improvement.

## Atomic staff workflows

Each button now sends one POST request:

| Action | Endpoint | Changes committed together |
| --- | --- | --- |
| Approve | `/triage/tickets/{id}/approve`, body `{"priority": 2}` | Create medical ticket, increment department load, remove triage ticket |
| Decline | `/triage/tickets/{id}/decline` | Remove triage ticket, set patient status to `rejected` |
| Call | `/medical/tickets/{id}/call` | Remove medical ticket, decrement department load, set patient status to `doctor` |

Read `app/mr_back/services/workflow_service.py` first. Its `run_transaction` helper opens a MongoDB session using the existing client and calls `with_transaction`. Every database operation receives that session. Writes commit together; an exception rolls them all back. PyMongo can retry the transaction on transient conflicts, so the callback only performs database work. This database session is separate from the user's login session.

MongoDB must support transactions. Local Compose now starts a **single-node replica set** named `triage-rs`. Run `docker compose up -d --wait` from the repository root to upgrade an existing local container; the same `fresh_mongodb` volume, accounts, and tickets are retained. Do not remove the volume. The startup script generates an internal replica-set key in that volume, and the health check initializes the replica set once and waits for a writable primary. Fresh installations use the same command. A single node enables transactions but does not provide high availability.

The three workflows reject missing/already-processed tickets and inconsistent patient/load states. The smoke test checks that two simultaneous approvals cannot move the same ticket twice. This change does not add ticket claims, workflow history, or request idempotency keys. If a response is lost after commit, refresh to see the outcome before retrying; a repeated completed action returns 404.

Reference: [PyMongo transactions](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/crud/transactions/).

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

Unit tests use isolated in-memory MongoDB substitutes; they test routing and permissions, not real transaction semantics. The smoke test uses the configured MongoDB replica set, creates temporary fictional accounts and its own department, and deletes only those records afterward. It verifies all three staff actions, rollback after injected write failures and a business-rule failure, simultaneous approval, and repeated actions. No pre-existing demo department is required. It leaves short-lived authentication rate-limit records for automatic TTL cleanup.

Frontend checks:

```sh
cd app/mr_ed
npm test
npm run build
npm audit
```

This work has not deployed the app or established readiness for real patient use. The repository's educational-use restriction still applies.
