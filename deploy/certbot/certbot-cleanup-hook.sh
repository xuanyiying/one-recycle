#!/bin/sh
set -e

# Certbot DNS-01 cleanup hook for Tencent Cloud DNS
# Deletes TXT record after ACME challenge verification

DOMAIN_NAME="${DOMAIN:-backbuy.cn}"
TENCENT_CLOUD_SECRET_ID="${TENCENT_CLOUD_SECRET_ID:-}"
TENCENT_CLOUD_SECRET_KEY="${TENCENT_CLOUD_SECRET_KEY:-}"

RECORD_NAME="_acme-challenge.${DOMAIN_NAME}"

echo "[Cleanup Hook] Starting cleanup for DNS-01 challenge"

if [ -z "$TENCENT_CLOUD_SECRET_ID" ] || [ -z "$TENCENT_CLOUD_SECRET_KEY" ]; then
    echo "[Cleanup Hook] ERROR: TENCENT_CLOUD_SECRET_ID or TENCENT_CLOUD_SECRET_KEY not set"
    exit 0
fi

RECORD_ID_FILE="/tmp/certbot_record_id"

if [ ! -f "$RECORD_ID_FILE" ]; then
    echo "[Cleanup Hook] No RecordId file found, skipping cleanup"
    exit 0
fi

RECORD_ID=$(cat "$RECORD_ID_FILE")
echo "[Cleanup Hook] Record ID: ${RECORD_ID}"

# Generate signature for Tencent Cloud API
generate_signature() {
    local secret_key="$1"
    local src_str="$2"

    echo -n "$src_str" | openssl dgst -sha256 -hmac "$secret_key" | sed 's/^.* //'
}

# Get current timestamp and nonce
TIMESTAMP=$(date +%s)
NONCE=$((RANDOM * RANDOM % 100000))

# Construct the string to sign
STRING_TO_SIGN="POSTdnspod.tencentcloudapi.com/?Action=DeleteRecord&Locale=zh-CN&SecretId=${TENCENT_CLOUD_SECRET_ID}&Timestamp=${TIMESTAMP}&Nonce=${NONCE}&Version=2021-03-23"

# Generate signature
SIGNATURE=$(generate_signature "$TENCENT_CLOUD_SECRET_KEY" "$STRING_TO_SIGN")

# Build the request payload
PAYLOAD=$(cat <<EOF
{
    "Domain": "${DOMAIN_NAME}",
    "Id": ${RECORD_ID}
}
EOF
)

# Make the API call
echo "[Cleanup Hook] Calling Tencent Cloud DNSPod API to delete TXT record..."

RESPONSE=$(curl -s -X POST "https://dnspod.tencentcloudapi.com/" \
    -H "Content-Type: application/json" \
    -H "Authorization: TC3-HMAC-SHA256 Credential=${TENCENT_CLOUD_SECRET_ID}/${TIMESTAMP}/dnspod/tc3_request, SignedHeaders=content-type;host, Signature=${SIGNATURE}" \
    -d "$PAYLOAD")

echo "[Cleanup Hook] API Response: ${RESPONSE}"

# Check if the request was successful
if echo "$RESPONSE" | grep -q '"Response":{"RequestId"'; then
    echo "[Cleanup Hook] TXT record deleted successfully"
    rm -f "$RECORD_ID_FILE"
    exit 0
else
    echo "[Cleanup Hook] Warning: Failed to delete TXT record (may already be deleted)"
    rm -f "$RECORD_ID_FILE"
    exit 0
fi
