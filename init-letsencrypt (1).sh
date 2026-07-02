#!/bin/bash
# init-letsencrypt.sh
#
# στο κανονικό nginx.prod.conf.
#
# Use:
#   chmod +x init-letsencrypt.sh
#   ./init-letsencrypt.sh spring.rmat.gr www.spring.rmat.gr your@email.com

set -e

DOMAIN1="${1:-spring.rmat.gr}"
DOMAIN2="${2:-www.spring.rmat.gr}"
EMAIL="${3}"

if [ -z "$EMAIL" ]; then
    echo "Use: ./init-letsencrypt.sh <domain1> <domain2> <email>"
    echo "ex.:   ./init-letsencrypt.sh spring.rmat.gr www.spring.rmat.gr you@example.com"
    exit 1
fi

echo "== Phase 1/4: Build frontend with BOOTSTRAP config (without SSL) =="
docker compose -f docker-compose.prod.yml build frontend --build-arg NGINX_ENV=bootstrap

echo "== Βήμα 2/4: Build postgres + backend + frontend (bootstrap) =="
docker compose -f docker-compose.prod.yml up -d postgres backend frontend

echo "== Waiting for nginx... =="
sleep 5

echo "== Phase 3/4: Ask Let's Encrypt for cert =="
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot -w /var/www/certbot \
    -d "$DOMAIN1" -d "$DOMAIN2" \
    --email "$EMAIL" --agree-tos --no-eff-email

echo "== Phase 4/4: Rebuild frontend with PROD config (SSL) and restart =="
docker compose -f docker-compose.prod.yml build frontend --build-arg NGINX_ENV=prod
docker compose -f docker-compose.prod.yml up -d --force-recreate frontend

echo ""
echo "Running on https://$DOMAIN1"

