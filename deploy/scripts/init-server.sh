#!/bin/bash
# OneRecycle Server Initialization Script
# Run this on the server before first deployment

set -e

REPO_URL="https://github.com/xuanyiying/one-recycle.git"
DEPLOY_DIR="/opt/one-recycle"
BRANCH="withoutai"

echo "=== OneRecycle Server Initialization ==="

# Install Docker if not exists
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose if not exists
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    apt-get update
    apt-get install -y docker-compose-plugin
fi

# Create deploy directory
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# Clone repository
if [ ! -d ".git" ]; then
    echo "Cloning repository..."
    git clone -b $BRANCH $REPO_URL .
else
    echo "Repository already exists, pulling latest..."
    git fetch origin
    git reset --hard origin/$BRANCH
fi

# Create required directories
mkdir -p deploy/data/postgres
mkdir -p deploy/data/redis
mkdir -p deploy/ssl
mkdir -p deploy/certbot-webroot
mkdir -p deploy/nginx

# Check if deploy.conf exists
if [ ! -f "deploy/deploy.conf" ]; then
    echo "ERROR: deploy/deploy.conf not found!"
    echo "Please create it from the example:"
    echo "  cp deploy/deploy.conf.example deploy/deploy.conf"
    echo "  nano deploy/deploy.conf"
    exit 1
fi

# Load configuration
source deploy/deploy.conf

# Create .env.production if not exists
if [ ! -f "deploy/.env.production" ]; then
    echo "Creating deploy/.env.production..."
    cat > deploy/.env.production << EOF
# Database
DATABASE_URL=postgresql://one_recycle:${DB_PASSWORD}@postgres:5432/one_recycle

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# JWT (change this!)
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=15m

# Other required env vars will be added here
EOF
    echo "WARNING: Please review and update deploy/.env.production"
fi

# Export variables for docker-compose
export DOMAIN
export EMAIL
export DB_PASSWORD
export REDIS_PASSWORD

# Start infrastructure services first
echo "Starting infrastructure services..."
docker compose -f deploy/docker-compose.yml up -d postgres redis

# Wait for database
echo "Waiting for database..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker compose -f deploy/docker-compose.yml run --rm backend npx prisma migrate deploy || true

# Start all services
echo "Starting all services..."
docker compose -f deploy/docker-compose.yml up -d

echo ""
echo "=== Initialization Complete ==="
echo "Services should be starting up..."
echo "Check status with: docker compose -f deploy/docker-compose.yml ps"
echo "View logs with: docker compose -f deploy/docker-compose.yml logs -f"
