# Virtual Triage frontend

React + Vite. See [the project setup guide](../../docs/SECURITY_AND_SETUP.md) for MongoDB, backend startup, staff accounts, and deployment configuration.

```sh
npm ci
npm start
npm test
npm run build
```

Development URL: http://localhost:3000. Production output: `build/`.

Set `VITE_API_URL` in `.env.local` to change the public API URL. It defaults to `/api`. In development, Vite proxies that path to FastAPI at `http://127.0.0.1:8000`; production hosting must configure its own API proxy. Never put database credentials or session secrets in frontend environment variables.

## Updated interface

The frontend has a shared teal-and-cream design, responsive navigation, and consistent loading, empty, error, and success states. It uses system fonts and local SVG icons without external asset services.

- **Departments:** queue estimates refresh every 30 seconds. Choosing a department preselects it in the intake form after login. Estimates use the prototype's existing `currentLoad × 15 minutes` calculation.
- **Patient intake:** a three-step form covers background, grouped symptoms, and review/consent. Back navigation keeps your entries.
- **Nurse workspace:** search submissions by patient or department, inspect readable symptom groups, and explicitly choose a priority. Declining a submission requires confirmation.
- **Doctor workspace:** review the backend's prioritized queue and call a patient.
- **Patient waiting room:** status and queue position refresh every 10 seconds, with clear reviewed, called, and declined states.

The homepage loads `/emergency/department` directly, keeping the loading state visible while retrying network failures, temporary gateway errors, and HTML startup responses for up to two minutes. Each initial request has a ten-second timeout with three seconds between attempts. The department request wakes the backend, which completes database initialization before serving it. There is no separate readiness request: the deployed `/api/` route can return the frontend HTML even when department requests work. After the initial load, normal 30-second polling resumes; leaving the page cancels pending requests and retries. If startup still fails, the page offers **Try again**.

Staff queues also refresh every 30 seconds. These are polling intervals, so another user's action may take up to that interval to appear; Refresh checks immediately. Approve, decline, and call each send one request; the backend commits the related database changes together in a transaction. See the setup guide for the endpoints and local MongoDB replica-set setup.

## Try the full workflow locally

Start MongoDB, FastAPI, and Vite using the setup guide. Register a fictional patient and submit an intake form. Create nurse and doctor accounts with the administrator CLI if you haven't already. Use separate browser profiles or log out between roles: assign a priority as the nurse, call the patient as the doctor, and return to the patient's waiting room to acknowledge the update.

`npm test` covers authentication guards, login, department retry, intake field preservation and payloads, consent, explicit nurse priority selection, and decline confirmation.
