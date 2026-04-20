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

# Ensure directory exists
mkdir -p "$(dirname "$CORS_CONF")"

# Start generating the CORS configuration
cat > "$CORS_CONF" << 'EOF'
# Auto-generated CORS configuration
# Do not edit manually - generated from CORS_ORIGINS environment variable

set $cors_origin "";

EOF

# Generate exact match for each origin
# Using IFS to split the comma-separated string correctly in POSIX sh
OLD_IFS=$IFS
IFS=','
for origin in $CORS_ORIGINS; do
  # Trim leading and trailing whitespace using shell parameter expansion
  # More portable than sed, works in all POSIX shells including busybox/ash
  origin="${origin#"${origin%%[![:space:]]*}"}"
  origin="${origin%"${origin##*[![:space:]]}"}"
  
  if [ -n "$origin" ]; then
    cat >> "$CORS_CONF" << EOF
if (\$http_origin = '$origin') {
    set \$cors_origin \$http_origin;
}

EOF
  fi
done
IFS=$OLD_IFS

echo "CORS configuration generated at $CORS_CONF"
# Check if file exists and has content
if [ -s "$CORS_CONF" ]; then
    echo "Content of $CORS_CONF:"
    cat "$CORS_CONF"
else
    echo "ERROR: $CORS_CONF is empty or was not created correctly"
    exit 1
fi

