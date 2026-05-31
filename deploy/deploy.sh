#!/bin/bash
set -e

# ============================================================
# AfricaVet Deploy Script - Build locally, deploy to server
# ============================================================
# Builds Docker images on your local machine, transfers them
# to the production server, and starts all services.
# ============================================================

SERVER_IP="83.228.241.6"
SERVER_USER="ubuntu"
SSH_KEY="deploy/AfricaVet-Server-Key"
APP_DIR="/home/ubuntu/africavet"
DEPLOY_DIR="$APP_DIR/deploy"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}>>> $1${NC}"; }
warn()  { echo -e "${YELLOW}>>> $1${NC}"; }
error() { echo -e "${RED}>>> $1${NC}"; exit 1; }

SSH_CMD="ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP"
SCP_CMD="scp -i $SSH_KEY -o StrictHostKeyChecking=no"

# Check SSH key exists
[ -f "$SSH_KEY" ] || error "SSH key not found: $SSH_KEY"

# ============================================================
# Step 1: Build Docker images locally
# ============================================================
info "Building Docker images locally..."

docker build -t africavet-backend:latest ./backend
info "Backend image built"

docker build -t africavet-admin:latest ./admin-next
info "Admin image built"

docker build -t africavet-frontend:latest ./frontend-site-web
info "Frontend image built"

# ============================================================
# Step 2: Save images to tar files
# ============================================================
info "Saving images to tar files..."
mkdir -p deploy/images

docker save africavet-backend:latest  | gzip > deploy/images/backend.tar.gz
info "Backend image saved"

docker save africavet-admin:latest    | gzip > deploy/images/admin.tar.gz
info "Admin image saved"

docker save africavet-frontend:latest | gzip > deploy/images/frontend.tar.gz
info "Frontend image saved"

# ============================================================
# Step 3: Transfer files to server
# ============================================================
info "Creating directories on server..."
$SSH_CMD "mkdir -p $DEPLOY_DIR"

info "Transferring image files to server..."
$SCP_CMD deploy/images/backend.tar.gz  $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/backend.tar.gz
info "Backend image transferred"

$SCP_CMD deploy/images/admin.tar.gz    $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/admin.tar.gz
info "Admin image transferred"

$SCP_CMD deploy/images/frontend.tar.gz $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/frontend.tar.gz
info "Frontend image transferred"

info "Transferring config files..."
$SCP_CMD deploy/docker-compose.prod.yml $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/docker-compose.prod.yml
$SCP_CMD deploy/.env.production         $SERVER_USER@$SERVER_IP:$APP_DIR/.env
$SCP_CMD deploy/nginx.conf              $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/nginx.conf
$SCP_CMD deploy/default.conf            $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/default.conf
$SCP_CMD deploy/default-ssl.conf        $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/default-ssl.conf
$SCP_CMD deploy/setup-ssl.sh            $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/setup-ssl.sh
$SCP_CMD deploy/setup-firewall.sh       $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/setup-firewall.sh
$SCP_CMD backend/config/database.sql    $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/init.sql
$SSH_CMD "chmod +x $DEPLOY_DIR/setup-ssl.sh $DEPLOY_DIR/setup-firewall.sh"

# Transfer migrations
info "Transferring migration files..."
$SSH_CMD "mkdir -p $APP_DIR/migrations"
$SCP_CMD backend/migrations/*.sql $SERVER_USER@$SERVER_IP:$APP_DIR/migrations/

# ============================================================
# Step 4: Load images on server
# ============================================================
info "Loading Docker images on server..."

$SSH_CMD "sudo docker load < $DEPLOY_DIR/backend.tar.gz"
info "Backend image loaded"

$SSH_CMD "sudo docker load < $DEPLOY_DIR/admin.tar.gz"
info "Admin image loaded"

$SSH_CMD "sudo docker load < $DEPLOY_DIR/frontend.tar.gz"
info "Frontend image loaded"

# ============================================================
# Step 5: Start containers
# ============================================================
info "Stopping existing containers (if any)..."
$SSH_CMD "cd $DEPLOY_DIR && sudo docker compose -f docker-compose.prod.yml --env-file $APP_DIR/.env down 2>/dev/null || true"

info "Starting containers..."
$SSH_CMD "cd $DEPLOY_DIR && sudo docker compose -f docker-compose.prod.yml --env-file $APP_DIR/.env up -d"

info "Waiting for database to be ready..."
$SSH_CMD "sleep 20"

# ============================================================
# Step 6: Run database migrations
# ============================================================
info "Running database migrations..."
$SSH_CMD "
  source $APP_DIR/.env
  for migration in \$(ls -1 $APP_DIR/migrations/*.sql 2>/dev/null | sort); do
    echo \"  Applying: \$(basename \$migration)\"
    sudo docker exec -i africavet-db mysql -u\"\$DB_USER\" -p\"\$DB_PASSWORD\" \"\$DB_NAME\" < \"\$migration\" 2>/dev/null || echo \"  (skipped or already applied)\"
  done
"

# ============================================================
# Step 7: Verify deployment
# ============================================================
info "Checking container status..."
$SSH_CMD "cd $DEPLOY_DIR && sudo docker compose -f docker-compose.prod.yml ps"

# Cleanup tar files on server to free disk space
info "Cleaning up transfer files on server..."
$SSH_CMD "rm -f $DEPLOY_DIR/backend.tar.gz $DEPLOY_DIR/admin.tar.gz $DEPLOY_DIR/frontend.tar.gz"

echo ""
echo "============================================================"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "============================================================"
echo ""
echo "  Frontend:  http://83.228.241.6       (futur: www.africavet.com)"
echo "  Admin:     http://83.228.241.6:8080  (futur: manager.africavet.com)"
echo "  API:       http://83.228.241.6/api/health"
echo ""
echo "  Post-deployment steps (run on server):"
echo ""
echo "  1. Firewall (one-time):"
echo "     $SSH_CMD 'bash $DEPLOY_DIR/setup-firewall.sh'"
echo ""
echo "  2. SSL (when DNS is configured):"
echo "     $SSH_CMD 'bash $DEPLOY_DIR/setup-ssl.sh'"
echo ""
