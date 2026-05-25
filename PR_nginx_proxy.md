# Fix: route API traffic through nginx (resolve 405 on `/auth/login`)

## Problem

In production, login (and any other API call) failed immediately:

```
POST http://145.24.237.105/auth/login  →  405 (Method Not Allowed)
```

The request never reached the API. Two things were going on:

- The frontend container (`vuur_frontend`) listens on port **80** and only serves the static React build.
- The API container (`vuur_api`) listens on port **8080**.
- `VITE_API_URL` was empty in the production build (`App/.env.local` is git-ignored, `App/.dockerignore` excludes `.env.*`, and no `--build-arg` is passed in CI), so `apiClient.ts` fell back to `BASE = ''` and axios sent every call as a **relative** URL — i.e. to `http://145.24.237.105` itself.
- nginx was configured for static files + SPA fallback only. A `POST` against `try_files` returns **405**. The request never touched the API, so CORS wasn't even relevant.

## Solution

Two coordinated changes that together let the frontend talk to the API on the **same origin**, so CORS becomes a non-issue and the publicly exposed port-8080 mapping is no longer required.

### 1. Prefix every backend route with `/api/`

All controllers now live under `/api/...`, giving nginx a single clean prefix to route on:

| Controller | Route |
|---|---|
| `Vuur.Api/Features/Auth/AuthController.cs` | `[Route("/api/auth")]` |
| `Vuur.Api/Features/Orders/OrderController.cs` | `[Route("/api/orders")]` |
| `Vuur.Api/Features/Orders/PaymentController.cs` | `[Route("/api/payments")]` |
| `Vuur.Api/Features/Users/AddressController.cs` | `[Route("/api/addresses")]` |
| `Vuur.Api/Features/Users/WishlistController.cs` | `[Route("/api/wishlist")]` |

When the frontend HTTP layer is wired up, calls go to paths like `/api/auth/login` (same origin as the page).

### 2. Add a reverse-proxy block to `App/nginx.conf`

```nginx
location /api/ {
    # GEEN trailing slash: het /api/ prefix wordt 1-op-1 doorgestuurd naar
    # de api container, omdat de ASP.NET routes ook met /api/ beginnen.
    proxy_pass         http://api:8080;
    proxy_http_version 1.1;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}
```

**Why no trailing slash on `proxy_pass`?** Because the ASP.NET routes also start with `/api/`. nginx's rule:

- `proxy_pass http://api:8080;` — **keeps** the matched prefix → forwards `/api/auth/login` → `/api/auth/login` ✅
- `proxy_pass http://api:8080/;` — **strips** the matched prefix → forwards `/api/auth/login` → `/auth/login` ❌ (would 404 because no such route exists)

### End-to-end flow

1. React calls `POST /api/auth/login`.
2. Browser sends `POST http://145.24.237.105/api/auth/login` → hits nginx on port 80.
3. nginx matches `location /api/` and forwards to `http://api:8080/api/auth/login` over the internal Docker network.
4. ASP.NET matches `[Route("/api/auth")]` → runs `Login`.
5. Response pipes back through nginx to the browser.

## Why this is the right fix

- **Same-origin** — frontend and API share `http://145.24.237.105`. Browser CORS rules don't apply, so no preflight `OPTIONS`, no `Cors__FrontendOrigin` matching headaches.
- **No build-time config** — `VITE_API_URL` can stay empty. We don't need to rebuild the frontend image when the server's IP or port changes.
- **Smaller attack surface** — port 8080 no longer needs to be public; the API is only reachable through nginx. *Optional follow-up:* drop the `ports: - "8080:8080"` mapping from `docker-compose.yml`.

## Files changed

- `App/nginx.conf` — added `location /api/` reverse-proxy block (no trailing slash on `proxy_pass`).
- `Vuur.Api/Features/**/Controller.cs` — all controller routes prefixed with `/api/...`.

## How to verify

1. Merge and let the deploy workflow rebuild + redeploy.
2. Hard-refresh the browser (Ctrl-Shift-R) so the new JS bundle is loaded.
3. Open DevTools → Network → try the request.
4. `POST http://145.24.237.105/api/auth/login` should return whatever the API actually replies (200, 401, etc.) — **not** 405 or 404.

### Troubleshooting

- **405 Method Not Allowed** → request path didn't start with `/api/`, so it fell through to nginx's SPA fallback. Check the call site.
- **404 Not Found** → request was proxied but the API has no route at that path. Likely a controller still missing the `/api/` prefix, or a typo (e.g. `/api/payment/...` vs `/api/payments/...`).
- **502 Bad Gateway** → nginx couldn't reach the API container. Check `docker compose ps` and `docker compose logs api`.
