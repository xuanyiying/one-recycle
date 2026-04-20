#!/bin/bash
# SSL Certificate Update Script for Tencent Cloud Certificates
# This script updates the SSL certificate files and reloads nginx

set -e

# Configuration
DOMAIN=${DOMAIN:-"backbuy.cn"}
SSL_DIR="/etc/nginx/ssl"
LIVE_DIR="$SSL_DIR/live/$DOMAIN"
BACKUP_DIR="$SSL_DIR/backup/$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if new certificate files exist
if [ ! -f "backbuy.cn_bundle.crt" ] && [ ! -f "backbuy.cn_bundle.pem" ]; then
    error "Certificate file not found. Please download from Tencent Cloud Console:"
    error "https://console.cloud.tencent.com/ssl"
    error "Expected files: backbuy.cn_bundle.crt (or .pem) and backbuy.cn.key"
fi

if [ ! -f "backbuy.cn.key" ]; then
    error "Private key file not found: backbuy.cn.key"
fi

log "Starting certificate update for $DOMAIN..."

# Create backup directory
log "Creating backup at $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"

# Backup existing certificates
if [ -d "$LIVE_DIR" ]; then
    cp -r "$LIVE_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true
    success "Backup created"
fi

# Create live directory
mkdir -p "$LIVE_DIR"

# Copy new certificate
log "Installing new certificate..."
if [ -f "backbuy.cn_bundle.crt" ]; then
    cp backbuy.cn_bundle.crt "$LIVE_DIR/fullchain.pem"
elif [ -f "backbuy.cn_bundle.pem" ]; then
    cp backbuy.cn_bundle.pem "$LIVE_DIR/fullchain.pem"
fi

cp backbuy.cn.key "$LIVE_DIR/privkey.pem"

# Set proper permissions
chmod 644 "$LIVE_DIR/fullchain.pem"
chmod 600 "$LIVE_DIR/privkey.pem"

success "Certificate files installed"

# Verify certificate
log "Verifying certificate..."
CERT_INFO=$(openssl x509 -in "$LIVE_DIR/fullchain.pem" -noout -subject -issuer -dates 2>&1)
if [ $? -eq 0 ]; then
    success "Certificate verification successful"
    echo "$CERT_INFO"
else
    error "Certificate verification failed"
fi

# Check if nginx is running
if docker ps | grep -q one-recycle-nginx; then
    log "Reloading nginx..."
    
    # Test nginx configuration
    if docker exec one-recycle-nginx nginx -t 2>&1; then
        success "Nginx configuration test passed"
        
        # Reload nginx
        if docker exec one-recycle-nginx nginx -s reload 2>&1; then
            success "Nginx reloaded successfully"
        else
            error "Failed to reload nginx"
        fi
    else
        error "Nginx configuration test failed"
    fi
else
    warn "Nginx container is not running. Please start it manually."
fi

# Test HTTPS connection
log "Testing HTTPS connection..."
sleep 2
if curl -fI "https://$DOMAIN" 2>&1 | grep -q "HTTP"; then
    success "HTTPS connection successful"
else
    warn "HTTPS connection test failed. Please check manually."
fi

log "Certificate update completed!"
log "Certificate will expire in $(openssl x509 -in "$LIVE_DIR/fullchain.pem" -noout -startdate -enddate | grep -E 'notBefore|notAfter')"
