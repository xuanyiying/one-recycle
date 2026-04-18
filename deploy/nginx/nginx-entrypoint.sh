#!/bin/sh
set -e

DOMAIN=${DOMAIN:-backbuy.cn}
CERT_PATH="/etc/nginx/ssl/live/$DOMAIN"

echo "=== Nginx Entrypoint ==="
echo "DOMAIN: $DOMAIN"
echo "CERT_PATH: $CERT_PATH"

if ! command -v openssl >/dev/null 2>&1; then
    echo "Installing openssl..."
    apk add --no-cache openssl 2>/dev/null || {
        echo "WARNING: Failed to install openssl, HTTPS setup may fail"
    }
fi

check_certificates() {
    if [ -d "$CERT_PATH" ] && [ -f "$CERT_PATH/fullchain.pem" ] && [ -f "$CERT_PATH/privkey.pem" ]; then
        echo "Certificates found at $CERT_PATH"
        return 0
    else
        echo "Certificates not found at $CERT_PATH"
        return 1
    fi
}

generate_self_signed_cert() {
    echo "Generating self-signed certificate for initial setup..."
    
    mkdir -p "$CERT_PATH"
    
    if [ ! -w "$CERT_PATH" ]; then
        echo "ERROR: Certificate directory is not writable: $CERT_PATH"
        return 1
    fi
    
    if ! command -v openssl >/dev/null 2>&1; then
        echo "ERROR: openssl not available, cannot generate certificate"
        return 1
    fi
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERT_PATH/privkey.pem" \
        -out "$CERT_PATH/fullchain.pem" \
        -subj "/CN=$DOMAIN" 2>/dev/null
    
    if [ $? -ne 0 ]; then
        echo "Failed to generate self-signed certificate (openssl error)"
        return 1
    fi
    
    if [ -f "$CERT_PATH/privkey.pem" ] && [ -f "$CERT_PATH/fullchain.pem" ]; then
        chmod 644 "$CERT_PATH/fullchain.pem"
        chmod 600 "$CERT_PATH/privkey.pem"
        echo "Self-signed certificate generated successfully for $DOMAIN"
        ls -la "$CERT_PATH/"
        return 0
    else
        echo "Failed to generate self-signed certificate (files not created)"
        return 1
    fi
}

setup_https() {
    mkdir -p /etc/nginx/conf.d
    
    if check_certificates; then
        echo "Valid certificates found, setting up HTTPS..."
    else
        echo "Certificates not found, generating self-signed cert for initial startup..."
        if ! generate_self_signed_cert; then
            echo "WARNING: Failed to generate certificates, HTTPS will be disabled"
            rm -f /etc/nginx/conf.d/https.conf
            return 1
        fi
    fi
    
    if [ -f /tmp/https.conf.template ]; then
        cp /tmp/https.conf.template /etc/nginx/conf.d/https.conf
        sed -i "s/backbuy.cn/$DOMAIN/g" /etc/nginx/conf.d/https.conf
        echo "HTTPS configuration enabled for domain: $DOMAIN"
        echo "Verifying certificate paths in config:"
        grep "ssl_certificate" /etc/nginx/conf.d/https.conf | head -2
        return 0
    else
        echo "WARNING: https.conf.template not found, HTTPS will be disabled"
        rm -f /etc/nginx/conf.d/https.conf
        return 1
    fi
}

setup_https

echo "Testing Nginx configuration..."
if ! nginx -t 2>&1; then
    echo "Nginx config test failed, removing HTTPS config and retrying..."
    rm -f /etc/nginx/conf.d/https.conf
    
    echo "Retrying Nginx config test without HTTPS..."
    if ! nginx -t 2>&1; then
        echo "FATAL: Nginx config still invalid after removing HTTPS"
        cat /etc/nginx/nginx.conf 2>/dev/null || echo "Cannot read nginx.conf"
        exit 1
    fi
    echo "Nginx will start without HTTPS (HTTP only mode)"
fi

echo "Starting Nginx..."
exec nginx -g 'daemon off;'
