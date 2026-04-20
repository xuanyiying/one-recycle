#!/bin/sh
# Generate CORS configuration based on environment variables

set -e

CORS_CONF="/etc/nginx/conf.d/cors.conf"

# Read CORS_ORIGINS from environment variable
if [ -z "$CORS_ORIGINS" ]; then
  echo "WARNING: CORS_ORIGINS not set, using default production domains"
  CORS_ORIGINS="https://backbuy.cn,https://www.backbuy.cn,https://admin.backbuy.cn,https://api.backbuy.cn"
fi

echo "Generating CORS configuration for origins: $CORS_ORIGINS"

# Start generating the CORS configuration
cat > "$CORS_CONF" << 'EOF'
# Auto-generated CORS configuration
# Do not edit manually - generated from CORS_ORIGINS environment variable

set $cors_origin "";

EOF

# Generate exact match for each origin
echo "$CORS_ORIGINS" | tr ',' '\n' | while read -r origin; do
  # Trim whitespace
  origin=$(echo "$origin" | xargs)
  
  if [ -n "$origin" ]; then
    cat >> "$CORS_CONF" << EOF
if (\$http_origin = '$origin') {
    set \$cors_origin \$http_origin;
}

EOF
  fi
done

echo "CORS configuration generated at $CORS_CONF"
cat "$CORS_CONF"
