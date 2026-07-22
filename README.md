# eGovERA Upscale Solution Frontend Application

Angular web application for the eGovERA Upscale tool. It provides a user interface to assess digital maturity, map digital business capabilities, and build a digital transformation roadmap. It communicates with the eGovERA Upscale Backend through a REST API and is part of the [eGovERA](https://joinup.ec.europa.eu/collection/egov-era/about) initiative published by the European Commission.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 22 LTS |
| yarn | 1.22+ |
| Git | any |
| Docker | 20.10+ *(optional, for container-based run)* |

> Angular CLI does not need to be installed globally; every build and serve command is exposed as a yarn/npm script.

---

## Local setup

### 1 · Clone the repository

```bash
git clone <repository-url>
cd frontend
```

### 2 · Install dependencies

```bash
yarn install
```

> `yarn.lock` is committed to the repository to ensure reproducible builds.
> Do not delete it; always use `yarn install` (not `npm install`) to preserve the exact dependency tree.

### 3 · Configure the backend URL

Edit `src/assets/config/env-json-config-dev.json` and set the `base` value to the URL of a running backend instance:

```json
{
  "modules": {
    "core": {
      "base": "http://localhost:8080/api",
      "userDetails": "/user-details"
    }
  }
}
```

### 4 · Start the development server

```bash
npm run dev
```

The app is served at <http://localhost:4200>. API calls to `/api/resources/**` are forwarded to the backend through the Angular dev proxy configured in `proxy.conf.json`. The default proxy target is `http://localhost:8080`. 

TLS verification is enabled (`"secure": true`); if your local backend uses HTTPS with a self-signed certificate, update the `target` value in `proxy.conf.json` and set `NODE_EXTRA_CA_CERTS=/path/to/cert.pem` before running `npm run dev`.

---

## Build

```bash
npm run build-prod
```

The compiled output is produced in `dist/`. To skip tests during a build:

```bash
npm run build-prod-skip-test
```

---

## Run with Docker

The `Dockerfile` uses a two-stage build:

- **Stage 1** - compiles the Angular app using Node.js 22 Alpine.
- **Stage 2** - serves the compiled output with Nginx on port 80.

```bash
# Build the Docker image
docker build -t egov-era-upscale-frontend .

# Run the container
docker run -p 8080:80 \
  -e BACKEND_HOST=<backend-hostname> \
  -e FRONTEND_HOST=<frontend-hostname> \
  egov-era-upscale-frontend
```

The application will be reachable at <http://localhost:8080>.

---

## Configuration

All parameters are configured via environment variables at container start-up.
The Nginx configuration (`nginx_default.conf.template.conf`) is processed by
`envsubst` when the container starts.

| Variable | Example value | Description |
|---|---|---|
| `BACKEND_HOST` | `backend.example.com` | Hostname of the backend instance. Nginx proxies `/api/resources/**` to `https://<BACKEND_HOST>`. |
| `FRONTEND_HOST` | `frontend.example.com` | Hostname used as the Nginx `server_name`. |

---

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Dev server with API proxy (port 4200) |
| `npm run start-local` | Dev server without proxy |
| `npm run build` | Standard build |
| `npm run build-dev` | Development build |
| `npm run build-prod` | Optimised production build |
| `npm run build-prod-skip-test` | Optimised production build, skipping tests |
| `npm test` | Run unit tests via Karma |

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before
submitting a merge request or opening an issue.

For security vulnerabilities, do **not** open a public issue, follow the process
described in [SECURITY.md](SECURITY.md).

By participating in this project you agree to abide by the
[Code of Conduct](CODE_OF_CONDUCT.md).

---

## Licence

Copyright © 2025 European Union.  
Licensed under the [European Union Public Licence (EUPL) v1.2](LICENSE).
