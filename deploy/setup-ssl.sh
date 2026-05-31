#!/bin/bash
set -e

# ============================================================
# AfricaVet - SSL Setup Script
# Prerequisites: DNS for africavet.com, www.africavet.com,
#   and manager.africavet.com must point to 83.228.241.6
# Run on the production server: ssh ubuntu@83.228.241.6
# Usage: cd /home/ubuntu/africavet/deploy && bash setup-ssl.sh
# ============================================================

APP_DIR="/home/ubuntu/africavet"
DEPLOY_DIR="$APP_DIR/deploy"
COMPOSE_FILE="$DEPLOY_DIR/docker-compose.prod.yml"
ENV_FILE="$APP_DIR/.env"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== AfricaVet SSL Setup ==="
echo ""

# Step 0: Verify we're in the right directory
if [ ! -f "$COMPOSE_FILE" ]; then
  echo -e "${RED}ERROR: docker-compose.prod.yml not found at $COMPOSE_FILE${NC}"
  echo "Make sure deployment has been run first."
  exit 1
fi

# Step 1: Check DNS resolution
echo "Checking DNS resolution..."
for domain in africavet.com www.africavet.com manager.africavet.com; do
  ip=$(dig +short "$domain" 2>/dev/null || nslookup "$domain" 2>/dev/null | grep -oP 'Address: \K[\d.]+' | tail -1 || echo "")
  if [ -z "$ip" ]; then
    echo -e "${RED}ERROR: $domain does not resolve. Configure DNS first.${NC}"
    exit 1
  fi
  echo "  $domain -> $ip"
done
echo ""

# Step 2: Ensure nginx and certbot containers are running
echo "Checking containers..."
if ! sudo docker ps --format '{{.Names}}' | grep -q 'africavet-nginx'; then
  echo -e "${YELLOW}Starting containers...${NC}"
  cd "$DEPLOY_DIR" && sudo docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up -d
  sleep 5
fi
echo ""

# Step 3: Obtain certificates with certbot (using docker compose to get correct volumes)
echo "Requesting SSL certificates..."
cd "$DEPLOY_DIR" && sudo docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" run --rm \
  certbot certonly --webroot -w /var/www/certbot \
  -d africavet.com -d www.africavet.com -d manager.africavet.com \
  --email admin@africavet.com --agree-tos --no-eff-email

echo ""

# Step 4: Switch nginx to SSL config
echo "Switching to SSL nginx configuration..."
cp "$DEPLOY_DIR/default-ssl.conf" "$DEPLOY_DIR/default.conf"

# Step 5: Reload nginx to pick up SSL config and certs
echo "Reloading nginx..."
sudo docker exec africavet-nginx nginx -t && sudo docker exec africavet-nginx nginx -s reload

# Step 6: Update CORS origins to use HTTPS in docker-compose environment
echo ""
echo -e "${YELLOW}NOTE: Update FRONTEND_URL and ADMIN_URL in $APP_DIR/.env to use https://${NC}"
echo "  FRONTEND_URL=https://www.africavet.com"
echo "  ADMIN_URL=https://manager.africavet.com"
echo "Then restart backend: sudo docker restart africavet-backend"

echo ""
echo -e "${GREEN}=== SSL Setup Complete ===${NC}"
echo ""
echo "  https://www.africavet.com"
echo "  https://manager.africavet.com"
echo ""
echo "Certificates will auto-renew via the certbot container (every 12h check)."
echo "To manually renew: cd $DEPLOY_DIR && sudo docker compose -f docker-compose.prod.yml run --rm certbot renew"
