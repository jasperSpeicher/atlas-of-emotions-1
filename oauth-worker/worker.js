// Cloudflare Workers OAuth provider for Decap CMS (GitHub backend)
// Endpoints:
//   GET /auth      -> redirects to GitHub OAuth authorize
//   GET /callback  -> exchanges code for token, posts token to opener via postMessage

/**
 * Environment variables required (set via `wrangler secret put`):
 * - GITHUB_CLIENT_ID: GitHub OAuth App client ID
 * - GITHUB_CLIENT_SECRET: GitHub OAuth App client secret
 * - ALLOWED_ORIGINS: Comma-separated list of allowed origins (e.g., https://jasperspeicher.github.io)
 * - REDIRECT_URL: Where to send users back to edit after auth (e.g., https://jasperspeicher.github.io/atlas-of-emotions-1/admin/)
 */

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

function textResponse(status, text, headers = {}) {
  return new Response(text, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8', ...headers },
  });
}

function htmlResponse(status, html, headers = {}) {
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', ...headers },
  });
}

function jsonResponse(status, obj, headers = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function withCors(origin, response) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin || '*');
  headers.set('Vary', 'Origin');
  return new Response(response.body, { status: response.status, headers });
}

function isOriginAllowed(env, origin) {
  if (!origin) return false;
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return allowed.includes(origin);
}

function generateState() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function handleAuth(request, env, url) {
  // Validate origin
  const origin = request.headers.get('Origin') || url.searchParams.get('origin');
  if (origin && !isOriginAllowed(env, origin)) {
    return textResponse(403, 'Forbidden origin');
  }

  const state = generateState();
  const callbackUrl = new URL('/callback', url.origin).toString();

  const authorizeUrl = new URL(GITHUB_AUTHORIZE_URL);
  authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', callbackUrl);
  authorizeUrl.searchParams.set('scope', 'repo');
  authorizeUrl.searchParams.set('state', state);

  const headers = new Headers({
    Location: authorizeUrl.toString(),
    'Set-Cookie': `decap_oauth_state=${encodeURIComponent(state)}; Path=/; HttpOnly; Secure; SameSite=Lax`,
  });
  return new Response(null, { status: 302, headers });
}

async function exchangeCodeForToken(env, code, redirectUri) {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!response.ok) {
    throw new Error(`GitHub token exchange failed: ${response.status}`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(`GitHub token error: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

async function handleCallback(request, env, url) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) {
    return textResponse(400, 'Missing code or state');
  }

  const stateCookie = getCookie(request, 'decap_oauth_state');
  if (!stateCookie || stateCookie !== state) {
    return textResponse(400, 'Invalid state');
  }

  const redirectUri = new URL('/callback', url.origin).toString();

  try {
    const token = await exchangeCodeForToken(env, code, redirectUri);

    const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const targetOrigin = allowedOrigins[0] || '*';

    const postMessageHtml = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>Authenticating…</title></head>
  <body>
    <script>
      (function() {
        try {
          var msg = 'authorization:github:success:' + ${JSON.stringify('')} + ${JSON.stringify('')};// placeholder
        } catch (e) {}
      })();
    </script>
  </body>
</html>`;

    // Proper HTML posting the token to the opener with the expected format
    const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>Authenticating…</title></head>
  <body>
    <p>Authentication complete. You may close this window.</p>
    <script>
      (function() {
        var token = ${JSON.stringify('')} + ${JSON.stringify('')};// placeholder
      })();
    </script>
    <script>
      (function() {
        var token = ${JSON.stringify('')} + ${JSON.stringify(token)};
        function send() {
          try {
            if (window.opener) {
              // Decap CMS expects this message format
              window.opener.postMessage('authorization:github:success:' + token, ${JSON.stringify(targetOrigin)});
            }
          } catch (e) {}
          try { window.close(); } catch (e) {}
          setTimeout(function(){ window.location.replace(${JSON.stringify(env.REDIRECT_URL || '/')}); }, 500);
        }
        // Give the opener a moment to attach event handlers
        setTimeout(send, 50);
      })();
    </script>
  </body>
</html>`;

    // Clear state cookie
    const headers = new Headers({ 'Content-Type': 'text/html; charset=utf-8' });
    headers.append('Set-Cookie', 'decap_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    return new Response(html, { status: 200, headers });
  } catch (err) {
    const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>Authentication error</title></head>
  <body>
    <pre>${(err && err.message) || 'Authentication failed'}</pre>
    <script>
      try {
        if (window.opener) {
          window.opener.postMessage('authorization:github:error:' + ${JSON.stringify((err && err.message) || 'error')}, '*');
        }
      } catch (e) {}
    </script>
  </body>
</html>`;
    return htmlResponse(500, html);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight for safety
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('Origin') || '*';
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Vary': 'Origin',
        },
      });
    }

    if (url.pathname === '/' || url.pathname === '') {
      return jsonResponse(200, { service: 'Decap CMS GitHub OAuth Provider', status: 'ok' });
    }

    if (url.pathname === '/auth') {
      return handleAuth(request, env, url);
    }

    if (url.pathname === '/callback') {
      return handleCallback(request, env, url);
    }

    return textResponse(404, 'Not found');
  },
};


