#!/bin/sh
set -e

DOMAIN=${DOMAIN:-backbuy.cn}
CERT_PATH="/etc/nginx/ssl/live/$DOMAIN"

echo "=== Nginx Entrypoint ==="
echo "DOMAIN: $DOMAIN"
echo "CERT_PATH: $CERT_PATH"

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
    
    openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
        -keyout "$CERT_PATH/privkey.pem" \
        -out "$CERT_PATH/fullchain.pem" \
        -subj "/CN=$DOMAIN" 2>/dev/null
    
    if [ -f "$CERT_PATH/privkey.pem" ] && [ -f "$CERT_PATH/fullchain.pem" ]; then
        echo "Self-signed certificate generated successfully for $DOMAIN"
        return 0
    else
        echo "Failed to generate self-signed certificate"
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
        return 0
    else
        echo "WARNING: https.conf.template not found, HTTPS will be disabled"
        rm -f /etc/nginx/conf.d/https.conf
        return 1
    fi
}

reload_nginx() {
    if nginx -t 2>/dev/null; then
        echo "Reloading Nginx..."
        nginx -s reload 2>/dev/null || true
    fi
}

setup_https

echo "Testing Nginx configuration..."
if ! nginx -t 2>&1; then
    echo "Nginx config test failed, removing HTTPS config..."
    rm -f /etc/nginx/conf.d/https.conf
    
    echo "Retrying Nginx config test without HTTPS..."
    if ! nginx -t 2>&1; then
        echo "FATAL: Nginx config still invalid after removing HTTPS"
        echo "Dumping nginx.conf for debugging:"
        cat /etc/nginx/nginx.conf
        exit 1
    fi
fi

echo "Starting Nginx..."
exec nginx -g 'daemon off;'
