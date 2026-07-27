# Deployment

## Production URL

> **TODO**: Replace this placeholder with the actual VPS public URL once provisioned.
> Example: `http://YOUR_VPS_IP` or `http://timizer.example.com`

## Prerequisites

- Docker and Docker Compose installed on the VPS
- Port 80 open in the firewall

## First deploy

1. **Clone the repository** on the VPS:
   ```
   git clone git@github.com:Billboc31/timizer-like.git
   cd timizer-like
   ```

2. **Create the production environment file** from the template:
   ```
   cp .env.production.example .env.production
   ```
   Edit `.env.production` and confirm the values are correct for your environment.

3. **Copy the provider signature asset** into the named volume.
   The volume must exist before the first start — start the backend service once to initialise it, then copy the file:
   ```
   docker compose -f docker-compose.prod.yml up -d backend
   docker compose -f docker-compose.prod.yml exec backend \
     mkdir -p /app/assets
   # Copy from the host (adjust the source path):
   docker cp /path/to/provider-signature.png \
     $(docker compose -f docker-compose.prod.yml ps -q backend):/app/assets/provider-signature.png
   ```

4. **Start all services**:
   ```
   docker compose -f docker-compose.prod.yml up -d
   ```

5. **Verify** the backend is healthy (see Health check below).

## Health check

```
curl http://YOUR_VPS_IP/health
```

Expected response:
```json
{"status": "ok", "database": "sqlite"}
```

A 200 status confirms the backend is running and the database is reachable.

## Update procedure

```
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Named volumes (`timizer-db`, `timizer-assets`) are not removed by `up -d`, so SQLite data and the provider signature survive image rebuilds and redeployments.

## Stopping the application

```
docker compose -f docker-compose.prod.yml down
```

To also remove the named volumes (deletes all data):
```
docker compose -f docker-compose.prod.yml down -v
```

## Checking logs

```
docker compose -f docker-compose.prod.yml logs -f
```
