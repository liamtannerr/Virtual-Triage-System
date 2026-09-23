# Deploy the demo backend on Render

The root `render.yaml` selects a free Python web service on the
`security/fresh-mongodb-auth` branch. MongoDB stays on Atlas. Local `.env` files
remain unchanged and must not be uploaded to Render or committed.

## Create the service

1. Commit and push the Render setup files on that branch.
2. In Render choose **New > Blueprint**, connect the GitHub repository, and select
   `security/fresh-mongodb-auth`. Use `render.yaml` and verify the plan is **Free**.
3. Render prompts for these environment variables:

   | Key | Value |
   | --- | --- |
   | `MONGODB_URI` | The full Atlas `mongodb+srv://...` URI with the database user's password substituted and URL-encoded if necessary |
   | `ALLOWED_ORIGINS` | A JSON array with the exact frontend origin, e.g. `["https://your-site.vercel.app"]`, without a trailing slash |

   The database user should have `readWrite` on `virtual_triage`. The Blueprint
   supplies production mode, database name, Python version, and session lifetime.
   `render_start.py` uses Render's `RENDER_EXTERNAL_HOSTNAME` for the host allowlist.
   A custom backend domain would need an explicit `ALLOWED_HOSTS` JSON array.

4. After the service exists, open its **Connect > Outbound** tab. Add **all** listed
   IP ranges to Atlas's **Database & Network Access > IP Access List**. Your laptop's
   allowed IP does not authorize Render. Avoid opening the database to all IPs.
5. If the initial start failed while Atlas access was being configured, use
   **Manual Deploy > Deploy latest commit** after saving the IP entries.
6. Open the service's public URL. `/` should return
   `{"message":"Virtual Triage API"}`. `/emergency/department` should return the
   two fictional departments and also serves as Render's database health check.

The startup script runs `manage.py seed-demo` before Uvicorn. It inserts only
missing demo departments; it does not change existing department loads or create
accounts. Staff accounts in your local Docker database do not transfer to Atlas.
Production `/docs` is deliberately disabled.

## If using New > Web Service instead

Use the same Git branch and these settings:

| Setting | Value |
| --- | --- |
| Runtime | Python 3 |
| Root directory | `app/mr_back` |
| Build command | `pip install -r requirements.txt` |
| Start command | `python render_start.py` |
| Instance | Free |
| Health check | `/emergency/department` |

Manually add every environment variable from `render.yaml`. The `sync: false`
entries need your actual values; do not enter the text `sync: false` as a value.

## Connect the frontend afterward

Keep Vercel's `VITE_API_URL=/api`. Once the Render URL is known, add a Vercel rewrite
from `/api/:path*` to `https://YOUR-SERVICE.onrender.com/:path*`, before the React SPA
fallback. This strips `/api` and keeps browser requests on the frontend origin so
the app's Strict cookies work. Preserve `Cache-Control: no-store` for API responses.
Verify the deployed Origin/Host forwarding and the full login flow before sharing
the demo. If the proxy forwards the frontend Host instead of the Render hostname,
explicitly add that frontend hostname to `ALLOWED_HOSTS`.

Render Free can sleep when idle. The frontend currently has a 15-second timeout;
a sleeping backend may initially show an error until it wakes. Cold-start handling
is a separate frontend follow-up. Forwarded client IPs are not trusted by this
startup command; behind proxies, the current authentication rate limit can be
shared across visitors. Proper trusted-proxy configuration is a deployment
follow-up, rather than trusting arbitrary client-provided forwarding headers.

References: [Render Blueprints](https://render.com/docs/blueprint-spec),
[outbound IP ranges](https://render.com/docs/outbound-ip-addresses),
[free instance limits](https://render.com/docs/free).
