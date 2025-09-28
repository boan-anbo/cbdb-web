# CBDB Web Deployment

This directory contains Docker configuration for deploying CBDB as a web application.

## Architecture

- **cbdb-backend**: NestJS server providing the API
- **cbdb-frontend**: React app served by nginx with API proxy
- **Internal networking**: Services communicate via Docker network
- **External access**: Only frontend exposed on port 3000

## Prerequisites

- Docker and Docker Compose installed
- CBDB SQLite database file (`cbdb_sql_db/latest.db`)
- Git repository cloned with all dependencies

## Quick Start

1. **Navigate to deployment directory:**
   ```bash
   cd deployment/web
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and start services:**
   ```bash
   docker-compose up --build -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api

## Configuration

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `CBDB_PATH`: Path to CBDB SQLite database
- `APP_DB_PATH`: Path for application data
- `FRONTEND_PORT`: Port to expose frontend (default: 3000)
- `LOG_LEVEL`: Logging verbosity (error/warn/info/debug)

### Caddy Integration

If you're using Caddy as a reverse proxy on your droplet:

```caddy
your-domain.com {
    reverse_proxy localhost:3000
}
```

The nginx container handles internal routing to the backend API.

## Development

### Build Images Locally

```bash
# Build backend only
docker-compose build cbdb-backend

# Build frontend only
docker-compose build cbdb-frontend
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f cbdb-backend
docker-compose logs -f cbdb-frontend
```

### Stop Services

```bash
docker-compose down

# With volume cleanup
docker-compose down -v
```

## Production Deployment

1. **On your server:**
   ```bash
   git clone <repo>
   cd cbdb-desktop/deployment/web
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   nano .env  # Update with production values
   ```

3. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

4. **Set up systemd service (optional):**
   ```bash
   sudo nano /etc/systemd/system/cbdb-web.service
   ```

   ```ini
   [Unit]
   Description=CBDB Web Application
   After=docker.service
   Requires=docker.service

   [Service]
   Type=oneshot
   RemainAfterExit=yes
   WorkingDirectory=/path/to/cbdb-desktop/deployment/web
   ExecStart=/usr/local/bin/docker-compose up -d
   ExecStop=/usr/local/bin/docker-compose down
   TimeoutStartSec=0

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl enable cbdb-web
   sudo systemctl start cbdb-web
   ```

## Troubleshooting

### Database Connection Issues

If the backend can't connect to the database:
1. Check that `cbdb_sql_db/latest.db` exists in the project root
2. Verify volume mounts in `docker-compose.yml`
3. Check backend logs: `docker-compose logs cbdb-backend`

### API Connection Issues

If the frontend can't reach the API:
1. Verify backend is running: `docker-compose ps`
2. Check nginx proxy configuration
3. Review frontend logs: `docker-compose logs cbdb-frontend`

### Port Conflicts

If port 3000 is already in use:
1. Change the port in `docker-compose.yml`
2. Update your Caddy configuration accordingly

## Updating

To update the application:

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

## Health Checks

Both services include health check endpoints:
- Frontend: http://localhost:3000/health
- Backend: http://localhost:3000/api/health

## Security Notes

- The CBDB database is mounted read-only to prevent accidental modifications
- Application data is stored in a Docker volume
- Consider using HTTPS via Caddy for production deployments
- Update CORS settings in production environment