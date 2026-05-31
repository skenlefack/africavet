#!/bin/bash
set -e

echo "=== AfricaVet Server Setup ==="

# Add swap (2GB) for build process on 2GB RAM server
if [ ! -f /swapfile ]; then
    echo ">>> Creating 2GB swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap created"
else
    echo "Swap already exists"
fi
free -h

# Create app directory
APP_DIR=/home/ubuntu/africavet
echo ">>> Setting up app directory at $APP_DIR"
mkdir -p $APP_DIR

# Copy .env
echo ">>> Setting up environment..."
cp $APP_DIR/deploy/.env.production $APP_DIR/.env

# Set permissions
echo ">>> Setting permissions..."
sudo chown -R ubuntu:ubuntu $APP_DIR

# Build and start with docker compose
echo ">>> Building Docker images (this may take 10-15 minutes)..."
cd $APP_DIR
sudo docker compose -f deploy/docker-compose.deploy.yml --env-file .env build --no-cache

echo ">>> Starting containers..."
sudo docker compose -f deploy/docker-compose.deploy.yml --env-file .env up -d

echo ">>> Waiting for database to be ready..."
sleep 20

# Run migrations
echo ">>> Running database migrations..."
for migration in $(ls -1 backend/migrations/*.sql | sort); do
    echo "  Applying: $(basename $migration)"
    sudo docker exec -i africavet-db mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$migration" 2>/dev/null || echo "  (skipped or already applied)"
done

echo ""
echo "=== Deployment Complete ==="
echo ">>> Checking container status..."
sudo docker compose -f deploy/docker-compose.deploy.yml ps

echo ""
echo "Services:"
echo "  Frontend:  http://83.228.241.6 (www.africavet.com)"
echo "  Admin:     http://83.228.241.6 (manager.africavet.com)"
echo "  API:       http://83.228.241.6/api/health"
echo ""
echo "To set up SSL, ensure DNS records point to this server, then run:"
echo "  sudo docker run --rm -v africavet_certbot_conf:/etc/letsencrypt -v africavet_certbot_www:/var/www/certbot certbot/certbot certonly --webroot -w /var/www/certbot -d africavet.com -d www.africavet.com -d manager.africavet.com --email admin@africavet.com --agree-tos --no-eff-email"
echo "  Then uncomment HTTPS blocks in deploy/default.conf and restart nginx"
