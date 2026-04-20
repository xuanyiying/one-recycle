#!/bin/sh
set -e

DOMAIN=${DOMAIN:-backbuy.cn}
CERT_PATH="/etc/nginx/ssl/live/$DOMAIN"
DUMMY_CERT_PATH="/tmp/dummy_certs/$DOMAIN"
HTTPS_CONF="/etc/nginx/conf.d/https.conf"

echo "=== Nginx Entrypoint ==="
echo "DOMAIN: $DOMAIN"
echo "CERT_PATH: $CERT_PATH"

# Install openssl if not available
if ! command -v openssl >/dev/null 2>&1; then
    echo "Installing openssl..."
    apk add --no-cache openssl 2>/dev/null || echo "WARNING: openssl install failed"
fi

check_certificates() {
    if [ -d "$CERT_PATH" ] && [ -f "$CERT_PATH/fullchain.pem" ] && [ -f "$CERT_PATH/privkey.pem" ]; then
        # Verify it's a valid certificate (not self-signed)
        ISSUER=$(openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -issuer 2>/dev/null || echo "")
        echo "Found certificate, issuer: $ISSUER"
        # Check if it's a Let's Encrypt certificate
        if echo "$ISSUER" | grep -q "Let's Encrypt"; then
            return 0
        fi
        # Check if it's a TrustAsia certificate (Tencent Cloud)
        if echo "$ISSUER" | grep -qi "TrustAsia"; then
            return 0
        fi
        # Check if it's a valid CA-signed certificate (not self-signed)
        if echo "$ISSUER" | grep -qv "CN=$DOMAIN"; then
            return 0
        fi
        echo "Certificate appears to be self-signed, using as temporary..."
        return 1
    else
        return 1
    fi
}

generate_self_signed_cert() {
    echo "Generating self-signed dummy certificate for initial startup..."
    mkdir -p "$DUMMY_CERT_PATH"
    # Generate a 2048-bit RSA key
    openssl genrsa -out "$DUMMY_CERT_PATH/privkey.pem" 2048 2>/dev/null
    # Generate a self-signed certificate with SAN for all subdomains
    openssl req -new -x509 -key "$DUMMY_CERT_PATH/privkey.pem" -days 365 \
        -out "$DUMMY_CERT_PATH/fullchain.pem" \
        -subj "/CN=$DOMAIN" \
        -addext "subjectAltName=DNS:$DOMAIN,DNS:www.$DOMAIN,DNS:api.$DOMAIN,DNS:admin.$DOMAIN" 2>/dev/null || \
    openssl req -new -x509 -key "$DUMMY_CERT_PATH/privkey.pem" -days 365 \
        -out "$DUMMY_CERT_PATH/fullchain.pem" \
        -subj "/CN=$DOMAIN" 2>/dev/null
    if [ -f "$DUMMY_CERT_PATH/privkey.pem" ] && [ -f "$DUMMY_CERT_PATH/fullchain.pem" ]; then
        chmod 644 "$DUMMY_CERT_PATH/fullchain.pem"
        chmod 600 "$DUMMY_CERT_PATH/privkey.pem"
        echo "Self-signed dummy certificate generated (temporary, will be replaced by Let's Encrypt)."
        return 0
    fi
    return 1
}

setup_https() {
    mkdir -p /etc/nginx/conf.d

    if check_certificates; then
        ISSUER=$(openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -issuer 2>/dev/null || echo "unknown")
        echo "Valid Let's Encrypt certificate found (issuer: $ISSUER)"
        
        if [ -f /tmp/https.conf.template ]; then
            cp /tmp/https.conf.template "$HTTPS_CONF"
            sed -i "s/backbuy.cn/$DOMAIN/g" "$HTTPS_CONF"
            echo "HTTPS config written for: $DOMAIN"
            return 0
        fi
    else
        echo "No certificate found, using self-signed dummy cert to unblock startup..."
        if ! generate_self_signed_cert; then
            echo "WARNING: Failed to generate self-signed cert, HTTPS disabled"
            echo "# HTTPS disabled" > "$HTTPS_CONF"
            return 1
        fi
        
        if [ -f /tmp/https.conf.template ]; then
            cp /tmp/https.conf.template "$HTTPS_CONF"
            sed -i "s/backbuy.cn/$DOMAIN/g" "$HTTPS_CONF"
            # Hijack the path strictly for the dummy cert start
            sed -i "s|/etc/nginx/ssl/live/$DOMAIN|/tmp/dummy_certs/$DOMAIN|g" "$HTTPS_CONF"
            echo "HTTPS config written and hijacked for dummy cert."
            return 0
        fi
    fi

    echo "WARNING: https.conf.template not found"
    echo "# HTTPS disabled" > "$HTTPS_CONF"
    return 1
}

setup_basic_config() {
    # Generate CORS configuration FIRST, before any nginx config test
    setup_cors

    if [ -f /etc/nginx/nginx.conf.template ]; then
        echo "Processing nginx.conf.template..."
        cp /etc/nginx/nginx.conf.template /etc/nginx/nginx.conf
        sed -i "s/backbuy.cn/$DOMAIN/g" /etc/nginx/nginx.conf
    fi
}

setup_cors() {
    mkdir -p /etc/nginx/conf.d
    # Always ensure the file exists so Nginx test doesn't fail even if generation fails
    touch /etc/nginx/conf.d/cors.conf
    
    if [ -f /nginx/generate-cors.sh ]; then
        echo "Generating CORS configuration..."
        # Use sh to execute to avoid issues with read-only mounts or permission bits in Docker
        sh /nginx/generate-cors.sh
    else
        echo "WARNING: generate-cors.sh not found, creating default cors.conf"
        cat > /etc/nginx/conf.d/cors.conf << 'EOF'
# Default CORS configuration (fallback)
set $cors_origin "";
if ($http_origin ~* '^https?://(www\.)?backbuy\.cn$') {
    set $cors_origin $http_origin;
}
EOF
    fi
}

setup_basic_config
setup_https

echo "Testing Nginx configuration..."
# Make sure we test with the actual binary and paths
if ! nginx -t 2>&1; then
    echo "Config test failed, disabling HTTPS..."
    # If the fail was due to something else than certs, disabling HTTPS might not help
    # but the current logic tries to fallback to HTTP-only to stay alive
    echo "# HTTPS disabled" > "$HTTPS_CONF"
    if ! nginx -t 2>&1; then
        echo "FATAL: Nginx config invalid even without HTTPS"
        # Try to restore basic config if possible
        if [ -f /etc/nginx/nginx.conf.template ]; then
             cp /etc/nginx/nginx.conf.template /etc/nginx/nginx.conf
             sed -i "s/backbuy.cn/$DOMAIN/g" /etc/nginx/nginx.conf
        fi
        exit 1
    fi
fi

echo "=== Starting background certificate Poller ==="
(
    LAST_MTIME=""
    CHECK_COUNT=0
    while true; do
        CHECK_COUNT=$((CHECK_COUNT + 1))
        
        if [ -f "$CERT_PATH/fullchain.pem" ]; then
            # Verify it's a valid CA-signed certificate (Let's Encrypt or TrustAsia/Tencent)
            ISSUER=$(openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -issuer 2>/dev/null || echo "")
            IS_VALID_CA_CERT=0
            if echo "$ISSUER" | grep -q "Let's Encrypt"; then
                IS_VALID_CA_CERT=1
            elif echo "$ISSUER" | grep -qi "TrustAsia"; then
                IS_VALID_CA_CERT=1
            fi
            
            CURRENT_MTIME=$(stat -c %Y "$CERT_PATH/fullchain.pem" 2>/dev/null || echo "0")
            
            # Trigger reload if:
            # 1. We are currently using dummy certs AND real CA cert is available
            # 2. OR the real certificate has been updated (renewal case)
            SHOULD_RELOAD=0
            if [ "$IS_VALID_CA_CERT" -eq 1 ] && grep -q "/tmp/dummy_certs" "$HTTPS_CONF" 2>/dev/null; then
                echo "[$(date)] Valid CA certificate detected, preparing to switch from dummy cert..."
                SHOULD_RELOAD=1
            elif [ -n "$LAST_MTIME" ] && [ "$CURRENT_MTIME" != "$LAST_MTIME" ]; then
                echo "[$(date)] Certificate file modified, preparing to reload..."
                SHOULD_RELOAD=1
            fi

            if [ "$SHOULD_RELOAD" -eq 1 ]; then
                echo "[$(date)] Reloading nginx with new certificate..."

                if grep -q "/tmp/dummy_certs" "$HTTPS_CONF" 2>/dev/null; then
                     echo "[$(date)] Switching from dummy certificate to CA-signed certificates..."
                     cp /tmp/https.conf.template "$HTTPS_CONF"
                     sed -i "s/backbuy.cn/$DOMAIN/g" "$HTTPS_CONF"
                fi

                # Test configuration before reloading
                if nginx -t 2>/dev/null; then
                    sleep 2
                    nginx -s reload 2>/dev/null && echo "[$(date)] Nginx reloaded successfully with new certificate" || echo "[$(date)] Nginx reload failed"
                else
                    echo "[$(date)] Nginx config test failed, not reloading"
                fi
            fi
            LAST_MTIME=$CURRENT_MTIME
        else
            # Log every 30 checks (5 minutes) that we're still waiting
            if [ $((CHECK_COUNT % 30)) -eq 0 ]; then
                echo "[$(date)] Waiting for Let's Encrypt certificate at $CERT_PATH..."
            fi
        fi
        sleep 10
    done
) &

echo "Starting Nginx in foreground..."
exec nginx -g 'daemon off;'
