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
        return 0
    else
        return 1
    fi
}

generate_self_signed_cert() {
    echo "Generating self-signed dummy certificate for initial startup in sandbox..."
    mkdir -p "$DUMMY_CERT_PATH"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$DUMMY_CERT_PATH/privkey.pem" \
        -out "$DUMMY_CERT_PATH/fullchain.pem" \
        -subj "/CN=$DOMAIN" 2>/dev/null
    if [ -f "$DUMMY_CERT_PATH/privkey.pem" ] && [ -f "$DUMMY_CERT_PATH/fullchain.pem" ]; then
        chmod 644 "$DUMMY_CERT_PATH/fullchain.pem"
        chmod 600 "$DUMMY_CERT_PATH/privkey.pem"
        echo "Self-signed dummy certificate generated in sandbox."
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

setup_https

echo "Testing Nginx configuration..."
if ! nginx -t 2>&1; then
    echo "Config test failed, disabling HTTPS..."
    echo "# HTTPS disabled" > "$HTTPS_CONF"
    if ! nginx -t 2>&1; then
        echo "FATAL: Nginx config invalid even without HTTPS"
        exit 1
    fi
fi

echo "=== Starting background certificate Poller ==="
(
    LAST_MTIME=""
    while true; do
        if [ -f "$CERT_PATH/fullchain.pem" ]; then
            CURRENT_MTIME=$(stat -c %Y "$CERT_PATH/fullchain.pem" 2>/dev/null || echo "0")
            
            # Trigger reload if:
            # 1. We are currently using dummy certs (transition case)
            # 2. OR the real certificate has been updated (renewal case)
            SHOULD_RELOAD=0
            if grep -q "/tmp/dummy_certs" "$HTTPS_CONF" 2>/dev/null; then
                SHOULD_RELOAD=1
            elif [ -n "$LAST_MTIME" ] && [ "$CURRENT_MTIME" != "$LAST_MTIME" ]; then
                SHOULD_RELOAD=1
            fi

            if [ "$SHOULD_RELOAD" -eq 1 ]; then
                echo "[$(date)] Let's Encrypt Certificate file appeared/changed, reloading config..."

                if grep -q "/tmp/dummy_certs" "$HTTPS_CONF" 2>/dev/null; then
                     echo "Hot-swapping from dummy certificate to real Let's Encrypt certificates..."
                     cp /tmp/https.conf.template "$HTTPS_CONF"
                     sed -i "s/backbuy.cn/$DOMAIN/g" "$HTTPS_CONF"
                fi

                sleep 2
                nginx -s reload 2>/dev/null && echo "[$(date)] Nginx reloaded OK" || echo "[$(date)] Nginx reload failed"
            fi
            LAST_MTIME=$CURRENT_MTIME
        fi
        sleep 10
    done
) &

echo "Starting Nginx in foreground..."
exec nginx -g 'daemon off;'
