#!/bin/sh
set -e

# Certbot DNS-01 authentication hook for Tencent Cloud DNS
# Creates TXT record for _acme-challenge.DOMAIN

CHALLENGE_TOKEN="${CERTBOT_VALIDATION}"
DOMAIN_NAME="${DOMAIN:-backbuy.cn}"
TENCENT_CLOUD_SECRET_ID="${TENCENT_CLOUD_SECRET_ID:-}"
TENCENT_CLOUD_SECRET_KEY="${TENCENT_CLOUD_SECRET_KEY:-}"

RECORD_NAME="_acme-challenge.${DOMAIN_NAME}"
RECORD_VALUE="${CHALLENGE_TOKEN}"

echo "[Auth Hook] Starting DNS-01 challenge for ${DOMAIN_NAME}"
echo "[Auth Hook] Record: ${RECORD_NAME}"
echo "[Auth Hook] Value: ${RECORD_VALUE}"

if [ -z "$CHALLENGE_TOKEN" ]; then
    echo "[Auth Hook] ERROR: CERTBOT_VALIDATION is not set"
    exit 1
fi

if [ -z "$TENCENT_CLOUD_SECRET_ID" ] || [ -z "$TENCENT_CLOUD_SECRET_KEY" ]; then
    echo "[Auth Hook] ERROR: TENCENT_CLOUD_SECRET_ID or TENCENT_CLOUD_SECRET_KEY not set"
    exit 1
fi

# Tencent Cloud DNSPod API call
# API Documentation: https://cloud.tencent.com/document/product/1427/50793

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
STRING_TO_SIGN="POSTdnspod.tencentcloudapi.com/?Action=CreateRecord&Locale=zh-CN&SecretId=${TENCENT_CLOUD_SECRET_ID}&Timestamp=${TIMESTAMP}&Nonce=${NONCE}&Version=2021-03-23"

# Generate signature
SIGNATURE=$(generate_signature "$TENCENT_CLOUD_SECRET_KEY" "$STRING_TO_SIGN")

# Build the request payload
PAYLOAD=$(cat <<EOF
{
    "Domain": "${DOMAIN_NAME}",
    "SubDomain": "_acme-challenge",
    "RecordType": "TXT",
    "RecordLine": "默认",
    "Value": "${RECORD_VALUE}",
    "TTL": 300
}
EOF
)

# Make the API call
echo "[Auth Hook] Calling Tencent Cloud DNSPod API to create TXT record..."

RESPONSE=$(curl -s -X POST "https://dnspod.tencentcloudapi.com/" \
    -H "Content-Type: application/json" \
    -H "Authorization: TC3-HMAC-SHA256 Credential=${TENCENT_CLOUD_SECRET_ID}/${TIMESTAMP}/dnspod/tc3_request, SignedHeaders=content-type;host, Signature=${SIGNATURE}" \
    -d "$PAYLOAD")

echo "[Auth Hook] API Response: ${RESPONSE}"

# Check if the request was successful
if echo "$RESPONSE" | grep -q '"Response":{"RecordId"'; then
    echo "[Auth Hook] TXT record created successfully"

    # Store RecordId for cleanup
    RECORD_ID=$(echo "$RESPONSE" | grep -o '"RecordId":[0-9]*' | grep -o '[0-9]*')
    echo "$RECORD_ID" > /tmp/certbot_record_id

    echo "[Auth Hook] Waiting 30 seconds for DNS propagation..."
    sleep 30

    exit 0
else
    echo "[Auth Hook] ERROR: Failed to create TXT record"
    echo "$RESPONSE"
    exit 1
fi
