#!/bin/bash
# ============================================================
# PostgreSQL Query Tuner - Amazon Linux 3 Deployment Script
# Usage: chmod +x deploy-al3.sh && ./deploy-al3.sh
# ============================================================

set -e  # Exit on any error

# ── Colors ──────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()    { echo -e "${GREEN}[✔]${NC} $1"; }
warn()   { echo -e "${YELLOW}[⚠]${NC} $1"; }
error()  { echo -e "${RED}[✘]${NC} $1"; exit 1; }
section(){ echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }

# ── Config (edit these before running) ──────────────────────
APP_DIR="/home/ec2-user/my-website"
APP_NAME="query-tuner"
NODE_VERSION="18"
PORT=3000

# AWS Bedrock config
AWS_REGION="us-east-1"
BEDROCK_MODEL="us.anthropic.claude-3-5-haiku-20241022-v1:0"

# Set to "keys" to use access keys, "role" to use IAM role (recommended for EC2)
AUTH_METHOD="role"

# Only needed if AUTH_METHOD=keys
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

# Git repo (leave empty to skip git clone)
GIT_REPO=""
# ────────────────────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   PostgreSQL Query Tuner - AL3 Deployment        ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── Step 1: System Update ────────────────────────────────────
section "Step 1: Updating System"
sudo dnf update -y
log "System updated"

# ── Step 2: Install Node.js ──────────────────────────────────
section "Step 2: Installing Node.js ${NODE_VERSION}"
if command -v node &>/dev/null; then
  log "Node.js already installed: $(node --version)"
else
  curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -
  sudo dnf install -y nodejs
  log "Node.js installed: $(node --version)"
fi

# ── Step 3: Install Git ──────────────────────────────────────
section "Step 3: Installing Git"
if ! command -v git &>/dev/null; then
  sudo dnf install -y git
fi
log "Git: $(git --version)"

# ── Step 4: Get Application Code ────────────────────────────
section "Step 4: Setting Up Application"
if [ -n "$GIT_REPO" ]; then
  if [ -d "$APP_DIR" ]; then
    warn "Directory exists, pulling latest changes..."
    cd "$APP_DIR" && git pull
  else
    git clone "$GIT_REPO" "$APP_DIR"
    log "Repository cloned to $APP_DIR"
  fi
else
  # Use current directory if no git repo specified
  APP_DIR=$(pwd)
  log "Using current directory: $APP_DIR"
fi

cd "$APP_DIR"

# ── Step 5: Install Dependencies ────────────────────────────
section "Step 5: Installing Dependencies"
npm install --production
log "Dependencies installed"

# ── Step 6: Create .env File ─────────────────────────────────
section "Step 6: Configuring Environment"
cat > .env << EOF
# AI Provider
AI_PROVIDER=bedrock
NODE_ENV=production
PORT=${PORT}

# AWS Bedrock
AWS_REGION=${AWS_REGION}
BEDROCK_MODEL=${BEDROCK_MODEL}
EOF

if [ "$AUTH_METHOD" = "keys" ]; then
  if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    warn "AUTH_METHOD=keys but no keys provided. Edit deploy-al3.sh and set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
  else
    echo "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}" >> .env
    echo "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}" >> .env
    log "AWS keys written to .env"
  fi
else
  log "Using IAM Role for AWS credentials (recommended)"
fi

log ".env file created"

# ── Step 7: Install PM2 ──────────────────────────────────────
section "Step 7: Installing PM2"
if ! command -v pm2 &>/dev/null; then
  sudo npm install -g pm2
fi
log "PM2: $(pm2 --version)"

# ── Step 8: Start App with PM2 ───────────────────────────────
section "Step 8: Starting Application"
# Stop existing instance if running
pm2 stop "$APP_NAME" 2>/dev/null || true
pm2 delete "$APP_NAME" 2>/dev/null || true

pm2 start server.js \
  --name "$APP_NAME" \
  --restart-delay=3000 \
  --max-restarts=10 \
  --log /home/ec2-user/logs/query-tuner.log \
  --error /home/ec2-user/logs/query-tuner-error.log

pm2 save

# Enable PM2 on system boot
PM2_STARTUP=$(pm2 startup | grep "sudo" | tail -1)
if [ -n "$PM2_STARTUP" ]; then
  eval "$PM2_STARTUP"
fi

log "Application started with PM2"

# ── Step 9: Install and Configure Nginx ──────────────────────
section "Step 9: Configuring Nginx"
if ! command -v nginx &>/dev/null; then
  sudo dnf install -y nginx
fi

sudo tee /etc/nginx/conf.d/query-tuner.conf > /dev/null << EOF
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    # Increase body size for large queries
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 120s;
    }
}
EOF

# Remove default nginx config if exists
sudo rm -f /etc/nginx/conf.d/default.conf

# Test nginx config
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
log "Nginx configured and started"

# ── Step 10: Configure Firewall ──────────────────────────────
section "Step 10: Configuring Firewall"
if command -v firewall-cmd &>/dev/null; then
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo firewall-cmd --reload
  log "Firewall rules added"
else
  warn "firewalld not found - make sure port 80 is open in your EC2 Security Group"
fi

# ── Step 11: Create Log Directory ────────────────────────────
mkdir -p /home/ec2-user/logs
log "Log directory created: /home/ec2-user/logs"

# ── Step 12: Test Bedrock Connection ─────────────────────────
section "Step 12: Testing AWS Bedrock Connection"
if [ -f "test-bedrock.js" ]; then
  node test-bedrock.js && log "Bedrock connection OK" || warn "Bedrock test failed - check IAM role or credentials"
else
  warn "test-bedrock.js not found, skipping Bedrock test"
fi

# ── Step 13: Health Check ────────────────────────────────────
section "Step 13: Running Health Check"
sleep 3
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/health)
if [ "$HTTP_STATUS" = "200" ]; then
  log "Health check passed (HTTP $HTTP_STATUS)"
else
  error "Health check failed (HTTP $HTTP_STATUS) - check logs: pm2 logs $APP_NAME"
fi

# ── Done ─────────────────────────────────────────────────────
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "your-ec2-ip")

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║           ✅  Deployment Complete!               ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo -e "  ${GREEN}Query Tuner:${NC}    http://${PUBLIC_IP}/query-tuner.html"
echo -e "  ${GREEN}Log Analyzer:${NC}   http://${PUBLIC_IP}/log-analyzer.html"
echo -e "  ${GREEN}Admission:${NC}      http://${PUBLIC_IP}/admission.html"
echo -e "  ${GREEN}Health Check:${NC}   http://${PUBLIC_IP}/health"
echo ""
echo -e "  ${BLUE}Useful commands:${NC}"
echo "    pm2 status                  # App status"
echo "    pm2 logs query-tuner        # View logs"
echo "    pm2 restart query-tuner     # Restart app"
echo "    sudo systemctl status nginx # Nginx status"
echo ""
echo -e "  ${YELLOW}⚠  Remember:${NC} Open port 80 in your EC2 Security Group!"
echo ""
