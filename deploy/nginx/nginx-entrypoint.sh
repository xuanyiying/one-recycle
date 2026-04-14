#!/bin/sh
set -e

DOMAIN=${DOMAIN:-backbuy.cn}
CERT_PATH="/etc/nginx/ssl/live/$DOMAIN"

check_certificates() {
    if [ -d "$CERT_PATH" ] && [ -f "$CERT_PATH/fullchain.pem" ] && [ -f "$CERT_PATH/privkey.pem" ]; then
        return 0
    else
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
    
    echo "Self-signed certificate generated for $DOMAIN"
}

setup_https() {
    mkdir -p /etc/nginx/conf.d
    
    if check_certificates; then
        echo "Valid certificates found, setting up HTTPS..."
    else
        echo "Certificates not found, generating self-signed cert for initial startup..."
        generate_self_signed_cert
    fi
    
    if [ -f /tmp/https.conf.template ]; then
        cp /tmp/https.conf.template /etc/nginx/conf.d/https.conf
        sed -i "s/backbuy.cn/$DOMAIN/g" /etc/nginx/conf.d/https.conf
        echo "HTTPS configuration enabled for domain: $DOMAIN"
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
if ! nginx -t; then
    echo "Nginx config test failed, removing HTTPS config..."
    rm -f /etc/nginx/conf.d/https.conf
    nginx -t || { echo "FATAL: Nginx config still invalid"; exit 1; }
fi

echo "Starting Nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

(
    while true; do
        sleep 60
        if check_certificates; then
            if [ ! -f /etc/nginx/conf.d/https.conf ]; then
                echo "Valid certificates detected, enabling HTTPS..."
                setup_https
                reload_nginx
            fi
        fi
    done
) &

wait $NGINX_PID
