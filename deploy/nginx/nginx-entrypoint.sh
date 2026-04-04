#!/bin/sh
set -e

# Function to check if certificates exist
check_certificates() {
    DOMAIN=${DOMAIN:-backbuy.cn}
    CERT_PATH="/etc/nginx/ssl/live/$DOMAIN"
    
    if [ -d "$CERT_PATH" ] && [ -f "$CERT_PATH/fullchain.pem" ] && [ -f "$CERT_PATH/privkey.pem" ]; then
        return 0
    else
        return 1
    fi
}

# Function to setup HTTPS configuration
setup_https() {
    local changed=0
    
    if check_certificates; then
        if [ ! -f /etc/nginx/conf.d/https.conf ]; then
            echo "Enabling HTTPS configuration..."
            # Copy and process template
            if [ -f /tmp/https.conf.template ]; then
                cp /tmp/https.conf.template /etc/nginx/conf.d/https.conf
                # Replace domain placeholder in template
                DOMAIN_NAME=${DOMAIN:-backbuy.cn}
                sed -i "s/backbuy.cn/$DOMAIN_NAME/g" /etc/nginx/conf.d/https.conf
                echo "HTTPS enabled for domain: $DOMAIN_NAME"
                changed=1
            fi
        fi
    else
        if [ -f /etc/nginx/conf.d/https.conf ]; then
            echo "Disabling HTTPS configuration (certificates not found)..."
            rm -f /etc/nginx/conf.d/https.conf
            changed=1
        fi
    fi
    
    return $changed
}

# Function to reload nginx if config changed
reload_nginx() {
    if nginx -t 2>/dev/null; then
        echo "Reloading Nginx..."
        nginx -s reload 2>/dev/null || true
    else
        echo "Nginx config test failed, not reloading"
    fi
}

# Initial setup
mkdir -p /etc/nginx/conf.d

if check_certificates; then
    echo "Certificates found, setting up HTTPS..."
else
    echo "Certificates not found, starting with HTTP only"
    echo "Certbot will attempt to obtain certificates in the background"
fi

setup_https || true

# Test nginx config
echo "Testing Nginx configuration..."
nginx -t

# Start nginx in background
echo "Starting Nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Monitor for certificate changes in background
(
    while true; do
        sleep 60
        if setup_https; then
            echo "Certificate status changed, reloading Nginx..."
            reload_nginx
        fi
    done
) &

# Wait for nginx
wait $NGINX_PID
