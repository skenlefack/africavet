#!/bin/bash
set -e

# ============================================================
# AfricaVet - Firewall Setup (UFW)
# Run on the production server: ssh ubuntu@83.228.241.6
# ============================================================

echo "Setting up UFW firewall..."

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow essential ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Admin panel (temporary IP access)

# Enable firewall (non-interactive)
sudo ufw --force enable

echo ""
sudo ufw status verbose
echo ""
echo "Firewall setup complete."
