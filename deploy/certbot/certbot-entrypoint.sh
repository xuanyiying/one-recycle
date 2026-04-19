#!/bin/sh
set -e

# Certbot entrypoint script for Let's Encrypt certificate management
# This script handles both initial certificate request and renewal

DOMAIN_NAME="${DOMAIN:-backbuy.cn}"
EMAIL="${EMAIL:-}"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN_NAME"
WEBROOT_PATH="/var/www/certbot"

echo "=== Certbot Entrypoint ==="
echo "DOMAIN: $DOMAIN_NAME"
echo "EMAIL: ${EMAIL:-not set}"
echo "CERT_PATH: $CERT_PATH"
echo "WEBROOT_PATH: $WEBROOT_PATH"

# Validate email is set
if [ -z "$EMAIL" ]; then
    echo "ERROR: EMAIL environment variable is required for Let's Encrypt"
    echo "Please set EMAIL in your .env file"
    exit 1
fi

# Function to check if certificate exists and is valid
check_cert() {
    if [ -d "$CERT_PATH" ] && [ -f "$CERT_PATH/fullchain.pem" ] && [ -f "$CERT_PATH/privkey.pem" ]; then
        # Check if certificate is valid and not expiring soon (30 days)
        if openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -checkend 2592000 2>/dev/null; then
            echo "Certificate exists and is valid for more than 30 days"
            return 0
        else
            echo "Certificate exists but will expire within 30 days"
            return 1
        fi
    fi
    return 1
}

# Function to request initial certificate
request_cert() {
    echo "[$(date)] Requesting initial certificate for $DOMAIN_NAME..."
    echo "Domains: $DOMAIN_NAME, www.$DOMAIN_NAME, api.$DOMAIN_NAME, admin.$DOMAIN_NAME"
    
    certbot certonly \
        --webroot \
        --webroot-path "$WEBROOT_PATH" \
        --domains "$DOMAIN_NAME" \
        --domains "www.$DOMAIN_NAME" \
        --domains "api.$DOMAIN_NAME" \
        --domains "admin.$DOMAIN_NAME" \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --non-interactive \
        --verbose 2>&1
    
    if [ $? -eq 0 ]; then
        echo "[$(date)] Certificate request successful!"
        # Set proper permissions
        chmod 644 "$CERT_PATH/fullchain.pem" 2>/dev/null || true
        chmod 600 "$CERT_PATH/privkey.pem" 2>/dev/null || true
        return 0
    else
        echo "[$(date)] Certificate request failed"
        return 1
    fi
}

# Function to renew certificate
renew_cert() {
    echo "[$(date)] Renewing certificate..."
    certbot renew \
        --webroot \
        --webroot-path "$WEBROOT_PATH" \
        --quiet \
        --no-random-sleep-on-renew 2>&1
    
    if [ $? -eq 0 ]; then
        echo "[$(date)] Certificate renewal successful or not needed"
        return 0
    else
        echo "[$(date)] Certificate renewal failed"
        return 1
    fi
}

# Main loop
trap 'echo "[$(date)] Received signal, exiting..."; exit 0' TERM INT

# Initial certificate request (with retry logic)
RETRY_COUNT=0
MAX_RETRIES=5
RETRY_DELAY=60

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if check_cert; then
        echo "Certificate already exists and is valid"
        break
    fi
    
    echo "Attempting to request certificate (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)..."
    if request_cert; then
        echo "Certificate obtained successfully!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        echo "Waiting ${RETRY_DELAY}s before retry..."
        sleep $RETRY_DELAY
        RETRY_DELAY=$((RETRY_DELAY * 2))  # Exponential backoff
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ] && ! check_cert; then
    echo "WARNING: Failed to obtain certificate after $MAX_RETRIES attempts"
    echo "Certbot will continue running and retry every 12 hours"
fi

# Renewal loop
echo "[$(date)] Starting renewal loop (checking every 12 hours)..."
while true; do
    sleep 12h
    
    echo "[$(date)] Checking certificate renewal..."
    if renew_cert; then
        echo "[$(date)] Renewal check completed"
    else
        echo "[$(date)] Renewal check failed, will retry in 12 hours"
    fi
done
