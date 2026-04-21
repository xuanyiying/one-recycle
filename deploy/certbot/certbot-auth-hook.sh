#!/bin/sh
set -e

# Certbot DNS-01 authentication hook for Tencent Cloud DNSPod
# Creates TXT record for _acme-challenge.DOMAIN
# Uses Python script with proper TC3-HMAC-SHA256 signature

CHALLENGE_TOKEN="${CERTBOT_VALIDATION}"
DOMAIN_NAME="${DOMAIN:-backbuy.cn}"

RECORD_NAME="_acme-challenge"

echo "[Auth Hook] Starting DNS-01 challenge for ${DOMAIN_NAME}"
echo "[Auth Hook] SubDomain: ${RECORD_NAME}"
echo "[Auth Hook] Value: ${CHALLENGE_TOKEN}"

if [ -z "$CHALLENGE_TOKEN" ]; then
    echo "[Auth Hook] ERROR: CERTBOT_VALIDATION is not set"
    exit 1
fi

# Check if Python is available
if ! command -v python3 > /dev/null 2>&1; then
    echo "[Auth Hook] ERROR: python3 is required but not installed"
    exit 1
fi

# Run the DNSPod client to create TXT record
echo "[Auth Hook] Creating TXT record via DNSPod API..."

RECORD_ID=$(python3 /certbot/dnspod_client.py create "${RECORD_NAME}" "${CHALLENGE_TOKEN}" 2>&1)

if [ $? -eq 0 ] && [ -n "$RECORD_ID" ] && [ "$RECORD_ID" -gt 0 ] 2>/dev/null; then
    echo "[Auth Hook] TXT record created successfully with ID: ${RECORD_ID}"

    # Store RecordId for cleanup
    echo "$RECORD_ID" > /tmp/certbot_record_id

    echo "[Auth Hook] Waiting 30 seconds for DNS propagation..."
    sleep 30

    exit 0
else
    echo "[Auth Hook] ERROR: Failed to create TXT record"
    echo "[Auth Hook] Response: ${RECORD_ID}"
    exit 1
fi
