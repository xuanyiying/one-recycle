FROM nginx:alpine

RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/conf.d /var/www/html /var/www/certbot && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/www/html /var/www/certbot

COPY nginx.conf /etc/nginx/nginx.conf
COPY https.conf.template /tmp/https.conf.template
COPY nginx-entrypoint.sh /nginx-entrypoint.sh

RUN chmod +x /nginx-entrypoint.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:80/health || exit 1

ENTRYPOINT ["/bin/sh", "/nginx-entrypoint.sh"]
