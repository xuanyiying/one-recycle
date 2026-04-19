#!/bin/bash
# SSL Certificate Diagnostic Script
# Usage: ./check-ssl.sh [domain]

set -e

DOMAIN="${1:-backbuy.cn}"
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SSL_DIR="$DEPLOY_DIR/ssl"

echo "=========================================="
echo "SSL Certificate Diagnostic for: $DOMAIN"
echo "=========================================="
echo ""

# Check if running on server with docker
if ! command -v docker &> /dev/null; then
    echo "WARNING: Docker not found. This script should be run on the server."
fi

echo "1. Checking SSL directory structure..."
echo "   SSL_DIR: $SSL_DIR"
if [ -d "$SSL_DIR" ]; then
    echo "   ✓ SSL directory exists"
    ls -la "$SSL_DIR"
else
    echo "   ✗ SSL directory does not exist"
    echo "   Creating: $SSL_DIR"
    mkdir -p "$SSL_DIR"
fi
echo ""

echo "2. Checking certificate files..."
CERT_PATH="$SSL_DIR/live/$DOMAIN"
if [ -d "$CERT_PATH" ]; then
    echo "   ✓ Certificate directory exists: $CERT_PATH"
    echo "   Contents:"
    ls -la "$CERT_PATH"
    
    if [ -f "$CERT_PATH/fullchain.pem" ]; then
        echo ""
        echo "3. Certificate details:"
        echo "   Issuer:"
        openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -issuer 2>/dev/null || echo "   ERROR: Could not read certificate"
        echo "   Subject:"
        openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -subject 2>/dev/null || echo "   ERROR: Could not read certificate"
        echo "   Validity:"
        openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -dates 2>/dev/null || echo "   ERROR: Could not read certificate"
        echo "   SAN (Subject Alternative Names):"
        openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -text 2>/dev/null | grep -A1 "Subject Alternative Name" || echo "   No SAN found"
        
        # Check if it's Let's Encrypt
        if openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -issuer 2>/dev/null | grep -q "Let's Encrypt"; then
            echo ""
            echo "   ✓ This is a Let's Encrypt certificate"
        else
            echo ""
            echo "   ⚠ WARNING: This does NOT appear to be a Let's Encrypt certificate"
            echo "   The certificate may be self-signed or from another CA"
        fi
        
        # Check certificate validity
        if openssl x509 -in "$CERT_PATH/fullchain.pem" -noout -checkend 0 2>/dev/null; then
            echo "   ✓ Certificate is currently valid"
        else
            echo "   ✗ WARNING: Certificate is expired or not yet valid"
        fi
    else
        echo "   ✗ fullchain.pem not found"
    fi
    
    if [ -f "$CERT_PATH/privkey.pem" ]; then
        echo "   ✓ Private key exists"
    else
        echo "   ✗ privkey.pem not found"
    fi
else
    echo "   ✗ Certificate directory does not exist: $CERT_PATH"
fi
echo ""

# Check Docker containers
if command -v docker &> /dev/null; then
    echo "4. Checking Docker containers..."
    
    echo "   Nginx container:"
    if docker ps | grep -q "one-recycle-nginx"; then
        echo "   ✓ Nginx is running"
        echo "   Recent logs:"
        docker logs --tail 10 one-recycle-nginx 2>/dev/null || echo "   Could not get logs"
    else
        echo "   ✗ Nginx is not running"
        echo "   All containers:"
        docker ps -a | grep one-recycle || echo "   No one-recycle containers found"
    fi
    echo ""
    
    echo "   Certbot container:"
    if docker ps | grep -q "one-recycle-certbot"; then
        echo "   ✓ Certbot is running"
        echo "   Recent logs:"
        docker logs --tail 20 one-recycle-certbot 2>/dev/null || echo "   Could not get logs"
    else
        echo "   ✗ Certbot is not running"
    fi
    echo ""
fi

echo "5. Testing HTTPS connection..."
if command -v curl &> /dev/null; then
    echo "   Testing https://api.$DOMAIN/health..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://api.$DOMAIN/health" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✓ HTTPS connection successful (HTTP 200)"
    else
        echo "   ✗ HTTPS connection failed (HTTP $HTTP_CODE)"
        echo "   Trying with -k (insecure) flag..."
        HTTP_CODE_INSECURE=$(curl -sk -o /dev/null -w "%{http_code}" "https://api.$DOMAIN/health" 2>/dev/null || echo "000")
        if [ "$HTTP_CODE_INSECURE" = "200" ]; then
            echo "   ⚠ Connection works with -k flag (certificate issue)"
        fi
    fi
else
    echo "   curl not available, skipping HTTPS test"
fi
echo ""

echo "=========================================="
echo "Diagnostic complete"
echo "=========================================="
echo ""
echo "Common issues and solutions:"
echo ""
echo "1. If certificate is self-signed:"
echo "   - Wait for Certbot to obtain Let's Encrypt certificate"
echo "   - Check Certbot logs: docker logs -f one-recycle-certbot"
echo "   - Ensure port 80 is open for ACME challenge"
echo ""
echo "2. If certificate files are missing:"
echo "   - Restart Certbot: docker restart one-recycle-certbot"
echo "   - Or force renewal: docker exec one-recycle-certbot certbot renew --force-renewal"
echo ""
echo "3. If Nginx is not using the certificate:"
echo "   - Restart Nginx: docker restart one-recycle-nginx"
echo "   - Check Nginx config: docker exec one-recycle-nginx nginx -t"
echo ""
echo "4. To manually trigger certificate request:"
echo "   docker exec one-recycle-certbot certbot certonly \\"
echo "     --webroot --webroot-path /var/www/certbot \\"
echo "     -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN -d admin.$DOMAIN \\"
echo "     --email your-email@example.com --agree-tos --non-interactive"
echo ""
