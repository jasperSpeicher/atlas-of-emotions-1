# Cloudflare Workers OAuth provider for Decap CMS (GitHub backend)

This worker enables Decap CMS login when your site is hosted on GitHub Pages.

## Required values
- GitHub OAuth App: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Worker secrets: `ALLOWED_ORIGINS`, `REDIRECT_URL`
  - `ALLOWED_ORIGINS`: Comma-separated list, e.g. `https://jasperspeicher.github.io`
  - `REDIRECT_URL`: Your admin URL, e.g. `https://jasperspeicher.github.io/atlas-of-emotions-1/admin/`

## Endpoints
- `GET /auth` → Redirects to GitHub authorization
- `GET /callback` → Exchanges code for token and notifies the opener

## Steps
1) Create GitHub OAuth App
   - Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
   - Application name: Atlas of Emotions CMS
   - Homepage URL: `https://jasperspeicher.github.io/atlas-of-emotions-1`
      - Authorization callback URL: `https://atlas-oe-decap-oauth.atlas-oe-decap-oauth.workers.dev/callback`
   - Save, then copy Client ID and generate Client Secret.


2) Deploy the worker
   - Install Wrangler (one-time):
     - `npm i -g wrangler` or `brew install wrangler`
   - Authenticate: `wrangler login`
   - From this folder: `wrangler secret put GITHUB_CLIENT_ID` and paste the Client ID
   - `wrangler secret put GITHUB_CLIENT_SECRET` and paste the Client Secret
   - `wrangler secret put ALLOWED_ORIGINS` → `https://jasperspeicher.github.io`
   - `wrangler secret put REDIRECT_URL` → `https://jasperspeicher.github.io/atlas-of-emotions-1/admin/`
   - Deploy: `wrangler deploy`
   - Note the deployed URL: `https://<your-worker-subdomain>.workers.dev`

3) Update Decap CMS config
   - In `static/admin/config.yml` set:
     ```yaml
     backend:
       name: github
       repo: jasperSpeicher/atlas-of-emotions-1
       branch: full-translation
       base_url: https://<your-worker-subdomain>.workers.dev
       auth_endpoint: /auth
     ```

4) Update GitHub OAuth App if needed
   - If your worker URL changed, update the OAuth App Authorization callback URL to `https://<your-worker-subdomain>.workers.dev/callback`.

5) Test
   - Visit `/admin` on your GitHub Pages site, click “Login with GitHub,” complete the flow.

## Notes
- If your repo is public, you can change the scope in `worker.js` from `repo` to `public_repo`.
- If your GitHub org uses SSO, approve the OAuth App for the org.
- Ensure browser blockers don’t block popups/third‑party cookies on your site during login.


