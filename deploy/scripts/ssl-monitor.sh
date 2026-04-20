#!/bin/bash
# SSL Certificate Monitor and Renewal Script for Tencent Cloud Certificates
# This script monitors certificate expiration and sends alerts

set -e

# Configuration
DOMAIN=${DOMAIN:-"backbuy.cn"}
CERT_PATH="/etc/nginx/ssl/live/$DOMAIN"
ALERT_DAYS_BEFORE=30  # Alert 30 days before expiration
EMAIL=${EMAIL:-"admin@backbuy.cn"}

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
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if certificate exists
if [ ! -f "$CERT_PATH/fullchain.pem" ]; then
    error "Certificate not found at $CERT_PATH/fullchain.pem"
    exit 1
fi

# Get certificate expiration date
EXPIRY_DATE=$(openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -z "$EXPIRY_DATE" ]; then
    error "Failed to read certificate expiration date"
    exit 1
fi

# Convert dates to seconds since epoch
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$EXPIRY_DATE" +%s)
CURRENT_EPOCH=$(date +%s)

# Calculate days until expiration
DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

log "Certificate for $DOMAIN expires in $DAYS_UNTIL_EXPIRY days (on $EXPIRY_DATE)"

# Get certificate issuer
ISSUER=$(openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -issuer 2>/dev/null | sed 's/issuer=//')
log "Certificate issuer: $ISSUER"

# Check if certificate is expiring soon
if [ $DAYS_UNTIL_EXPIRY -le $ALERT_DAYS_BEFORE ]; then
    warn "Certificate will expire in $DAYS_UNTIL_EXPIRY days!"
    warn "Please renew the certificate from Tencent Cloud Console:"
    warn "https://console.cloud.tencent.com/ssl"
    
    # Send email alert (if mail command is available)
    if command -v mail >/dev/null 2>&1; then
        echo "SSL Certificate for $DOMAIN will expire in $DAYS_UNTIL_EXPIRY days on $EXPIRY_DATE.

Please renew the certificate from Tencent Cloud Console:
https://console.cloud.tencent.com/ssl

After renewal:
1. Download the new certificate
2. Replace files in deploy/ssl/ directory:
   - backbuy.cn_bundle.crt -> fullchain.pem
   - backbuy.cn.key -> privkey.pem
3. Restart nginx: docker restart one-recycle-nginx

Certificate Details:
- Domain: $DOMAIN
- Issuer: $ISSUER
- Expiration: $EXPIRY_DATE
- Days Remaining: $DAYS_UNTIL_EXPIRY" | mail -s "[URGENT] SSL Certificate Expiring Soon - $DOMAIN" "$EMAIL"
        
        success "Email alert sent to $EMAIL"
    else
        warn "Email command not available. Please manually check certificate expiration."
    fi
    
    # Exit with error code to indicate action needed
    exit 2
else
    success "Certificate is valid for $DAYS_UNTIL_EXPIRY more days"
    exit 0
fi
