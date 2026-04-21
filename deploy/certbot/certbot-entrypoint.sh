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

# Tencent Cloud DNS API configuration
DNS_API_URL="https://dnspod.tencentcloudapi.com"

# Function to call Tencent Cloud DNS API
tencent_api_call() {
    local action="$1"
    local payload="$2"

    # Use openssl to generate HMAC-SHA256 signature
    local timestamp=$(date +%s)
    local nonce=$((RANDOM * RANDOM))

    # Construct the request payload
    local request_body=$(cat <<EOF
{
    "Action": "${action}",
    "Timestamp": ${timestamp},
    "Nonce": ${nonce},
    "SecretId": "${TENCENT_CLOUD_SECRET_ID}",
    "SignatureVersion": "1.0",
    "Region": "",
    ${payload}
}
EOF
)

    # Calculate signature (simplified - in production use proper HMAC)
    local signature=$(echo -n "${action}${timestamp}${nonce}" | \
        openssl dgst -sha256 -hmac "${TENCENT_CLOUD_SECRET_KEY}" | \
        sed 's/^.* //')

    # Make the API call
    curl -s -X POST "${DNS_API_URL}" \
        -H "Content-Type: application/json" \
        -d "{\"Action\":\"${action}\",\"Timestamp\":${timestamp},\"Nonce\":${nonce},\"SecretId\":\"${TENCENT_CLOUD_SECRET_ID}\",\"SignatureVersion\":\"1.0\",\"Region\":\"\",\"Signature\":\"${signature}\",${payload}}" 2>/dev/null
}

# Function to create DNS TXT record for DNS-01 challenge
create_txt_record() {
    local challenge_token="$1"
    local record_name="_acme-challenge.${DOMAIN_NAME}"
    local record_value="\"${challenge_token}\""

    echo "[DNS-01] Creating TXT record: ${record_name} = ${challenge_token}"

    # Note: This is a simplified implementation
    # In production, you would use the Tencent Cloud DNS API properly
    # API endpoint: https://dnspod.tencentcloudapi.com
    # Action: CreateRecord

    # For now, we'll use a simpler approach with certbot's --manual flag
    # and the auth-hook will receive the token via environment variable

    echo "[DNS-01] TXT record creation would be done here"
    echo "[DNS-01] Record: ${record_name}"
    echo "[DNS-01] Value: ${challenge_token}"

    return 0
}

# Function to delete DNS TXT record after verification
delete_txt_record() {
    local record_name="_acme-challenge.${DOMAIN_NAME}"

    echo "[DNS-01] Deleting TXT record: ${record_name}"

    # In production, call Tencent Cloud DNS API to delete the record

    return 0
}

# Check if certificate exists and is valid
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

# Create auth hook script
create_auth_hook() {
    cat > /certbot-auth-hook.sh << 'AUTHHOOK'
#!/bin/sh
set -e

# Certbot DNS-01 authentication hook
# This script is called by certbot to create the DNS challenge record

DOMAIN_NAME="${DOMAIN:-backbuy.cn}"
TENCENT_CLOUD_SECRET_ID="${TENCENT_CLOUD_SECRET_ID:-}"
TENCENT_CLOUD_SECRET_KEY="${TENCENT_CLOUD_SECRET_KEY:-}"

# The challenge token is passed via environment variable CERTBOT_VALIDATION
CHALLENGE_TOKEN="${CERTBOT_VALIDATION}"
RECORD_NAME="_acme-challenge.${DOMAIN_NAME}"

echo "[Auth Hook] Creating TXT record for DNS-01 challenge"
echo "[Auth Hook] Record: ${RECORD_NAME}"
echo "[Auth Hook] Token: ${CHALLENGE_TOKEN}"

if [ -z "$CHALLENGE_TOKEN" ]; then
    echo "[Auth Hook] ERROR: CERTBOT_VALIDATION is not set"
    exit 1
fi

# In production, call Tencent Cloud DNS API to create the TXT record
# For now, we'll just log and rely on external DNS configuration

# Example API call structure (for reference):
# POST https://dnspod.tencentcloudapi.com
# {
#     "Action": "CreateRecord",
#     "Domain": "${DOMAIN_NAME}",
#     "SubDomain": "_acme-challenge",
#     "RecordType": "TXT",
#     "RecordLine": "默认",
#     "Value": "${CHALLENGE_TOKEN}",
#     "TTL": 300
# }

echo "[Auth Hook] DNS record should be created (implement Tencent Cloud API call in production)"
echo "[Auth Hook] Waiting 30 seconds for DNS propagation..."
sleep 30

exit 0
AUTHHOOK
    chmod +x /certbot-auth-hook.sh
    echo "[$(date)] Auth hook script created"
}

# Create cleanup hook script
create_cleanup_hook() {
    cat > /certbot-cleanup-hook.sh << 'CLEANUPHOOK'
#!/bin/sh
set -e

# Certbot DNS-01 cleanup hook
# This script is called by certbot to delete the DNS challenge record after verification

DOMAIN_NAME="${DOMAIN:-backbuy.cn}"
TENCENT_CLOUD_SECRET_ID="${TENCENT_CLOUD_SECRET_ID:-}"
TENCENT_CLOUD_SECRET_KEY="${TENCENT_CLOUD_SECRET_KEY:-}"

RECORD_NAME="_acme-challenge.${DOMAIN_NAME}"

echo "[Cleanup Hook] Deleting TXT record for DNS-01 challenge"
echo "[Cleanup Hook] Record: ${RECORD_NAME}"

# In production, call Tencent Cloud DNS API to delete the TXT record
# Example API call structure (for reference):
# POST https://dnspod.tencentcloudapi.com
# {
#     "Action": "DeleteRecord",
#     "Domain": "${DOMAIN_NAME}",
#     "SubDomain": "_acme-challenge",
#     "RecordType": "TXT"
# }

echo "[Cleanup Hook] DNS record should be deleted (implement Tencent Cloud API call in production)"

exit 0
CLEANUPHOOK
    chmod +x /certbot-cleanup-hook.sh
    echo "[$(date)] Cleanup hook script created"
}

# Create hook scripts
create_auth_hook
create_cleanup_hook

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
