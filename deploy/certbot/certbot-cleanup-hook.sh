#!/bin/sh
set -e

# Certbot DNS-01 cleanup hook for Tencent Cloud DNSPod
# Deletes TXT record after ACME challenge verification

DOMAIN_NAME="${DOMAIN:-backbuy.cn}"

RECORD_NAME="_acme-challenge"

echo "[Cleanup Hook] Starting cleanup for DNS-01 challenge"

# Check if Python is available
if ! command -v python3 > /dev/null 2>&1; then
    echo "[Cleanup Hook] ERROR: python3 is required but not installed"
    exit 0
fi

RECORD_ID_FILE="/tmp/certbot_record_id"

if [ ! -f "$RECORD_ID_FILE" ]; then
    echo "[Cleanup Hook] No RecordId file found, skipping cleanup"
    exit 0
fi

RECORD_ID=$(cat "$RECORD_ID_FILE")
echo "[Cleanup Hook] Record ID: ${RECORD_ID}"

if [ -z "$RECORD_ID" ] || [ "$RECORD_ID" -le 0 ] 2>/dev/null; then
    echo "[Cleanup Hook] Invalid RecordId, skipping cleanup"
    rm -f "$RECORD_ID_FILE"
    exit 0
fi

# Run the DNSPod client to delete TXT record
echo "[Cleanup Hook] Deleting TXT record via DNSPod API..."

RESULT=$(python3 /certbot/dnspod_client.py delete "$RECORD_ID" 2>&1)

if [ $? -eq 0 ]; then
    echo "[Cleanup Hook] TXT record deleted successfully"
else
    echo "[Cleanup Hook] Warning: Failed to delete TXT record (may already be deleted)"
    echo "[Cleanup Hook] Response: ${RESULT}"
fi

rm -f "$RECORD_ID_FILE"
exit 0
