#!/bin/sh
set -e

# Certbot entrypoint script for Let's Encrypt wildcard certificate (*.backbuy.cn)
# Uses DNS-01 challenge with Tencent Cloud DNS API

DOMAIN_NAME="${DOMAIN:-backbuy.cn}"
EMAIL="${EMAIL:-}"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN_NAME"
TENCENT_CLOUD_SECRET_ID="${TENCENT_CLOUD_SECRET_ID:-}"
TENCENT_CLOUD_SECRET_KEY="${TENCENT_CLOUD_SECRET_KEY:-}"

echo "=== Certbot DNS-01 Entrypoint for Wildcard ==="
echo "DOMAIN: $DOMAIN_NAME"
echo "EMAIL: ${EMAIL:-not set}"
echo "CERT_PATH: $CERT_PATH"

# Validate required environment variables
if [ -z "$EMAIL" ]; then
    echo "ERROR: EMAIL environment variable is required for Let's Encrypt"
    exit 1
fi

if [ -z "$TENCENT_CLOUD_SECRET_ID" ] || [ -z "$TENCENT_CLOUD_SECRET_KEY" ]; then
    echo "ERROR: TENCENT_CLOUD_SECRET_ID and TENCENT_CLOUD_SECRET_KEY are required for DNS-01 challenge"
    echo "Please set these in your environment"
    exit 1
fi

# Check if Python is available
if ! command -v python3 > /dev/null 2>&1; then
    echo "ERROR: python3 is required but not installed in certbot container"
    exit 1
fi

# Check if dnspod_client.py exists
if [ ! -f "/certbot/dnspod_client.py" ]; then
    echo "ERROR: /certbot/dnspod_client.py not found"
    exit 1
fi

# Check if auth/cleanup hooks exist
if [ ! -f "/certbot-auth-hook.sh" ]; then
    echo "ERROR: /certbot-auth-hook.sh not found"
    exit 1
fi

if [ ! -f "/certbot-cleanup-hook.sh" ]; then
    echo "ERROR: /certbot-cleanup-hook.sh not found"
    exit 1
fi

# Make hooks executable
chmod +x /certbot-auth-hook.sh /certbot-cleanup-hook.sh 2>/dev/null || true

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

# Function to request wildcard certificate using DNS-01 challenge
request_cert() {
    echo "[$(date)] Requesting wildcard certificate for *.$DOMAIN_NAME"
    echo "[DNS-01] This requires DNS configuration for ${DOMAIN_NAME}"

    # First, check if DNS is configured correctly
    echo "[DNS-01] Verifying DNS configuration for ${DOMAIN_NAME}..."

    # Request certificate with DNS-01 challenge
    # The --manual flag with auth-hook will be called for the challenge
    certbot certonly \
        --manual \
        --preferred-challenges=dns \
        --manual-auth-hook="/bin/sh /certbot-auth-hook.sh" \
        --manual-cleanup-hook="/bin/sh /certbot-cleanup-hook.sh" \
        --domains "*.$DOMAIN_NAME" \
        --domains "$DOMAIN_NAME" \
        --domains "www.$DOMAIN_NAME" \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --non-interactive \
        --verbose 2>&1

    local result=$?

    if [ $result -eq 0 ]; then
        echo "[$(date)] Certificate request successful!"
        chmod 644 "$CERT_PATH/fullchain.pem" 2>/dev/null || true
        chmod 600 "$CERT_PATH/privkey.pem" 2>/dev/null || true
        return 0
    else
        echo "[$(date)] Certificate request failed with exit code $result"
        return 1
    fi
}

# Function to renew certificate
renew_cert() {
    echo "[$(date)] Renewing certificate..."
    certbot renew \
        --manual \
        --preferred-challenges=dns \
        --manual-auth-hook="/bin/sh /certbot-auth-hook.sh" \
        --manual-cleanup-hook="/bin/sh /certbot-cleanup-hook.sh" \
        --quiet \
        --no-random-sleep-on-renew 2>&1

    local result=$?
    if [ $result -eq 0 ]; then
        echo "[$(date)] Certificate renewal successful or not needed"
        return 0
    else
        echo "[$(date)] Certificate renewal failed with exit code $result"
        return 1
    fi
}

# Main loop
trap 'echo "[$(date)] Received signal, exiting..."; exit 0' TERM INT

# Initial certificate request with retry
RETRY_COUNT=0
MAX_RETRIES=5
RETRY_DELAY=60

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if check_cert; then
        echo "Certificate already exists and is valid"
        break
    fi

    echo "[$(date)] Attempting to request certificate (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)..."

    # Check DNS configuration first
    echo "[DNS-01] Please ensure you have configured:"
    echo "[DNS-01] 1. API credentials (TENCENT_CLOUD_SECRET_ID, TENCENT_CLOUD_SECRET_KEY)"
    echo "[DNS-01] 2. DNS provider permissions for ${DOMAIN_NAME}"
    echo "[DNS-01] 3. Network access to Tencent Cloud DNS API"

    if request_cert; then
        echo "Certificate obtained successfully!"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        echo "Waiting ${RETRY_DELAY}s before retry..."
        sleep $RETRY_DELAY
        RETRY_DELAY=$((RETRY_DELAY * 2))
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
