# Hosting Quick Start Guide

Choose your hosting method and get deployed in minutes!

## 🎯 Choose Your Path

### 1️⃣ Easiest (No Server Management)
**Railway, Render, or Heroku** - Perfect for beginners
- ⏱️ Time: 5-10 minutes
- 💰 Cost: Free tier available
- 🔧 Maintenance: Automatic

### 2️⃣ Docker (Containerized)
**Docker or Docker Compose** - Best for consistency
- ⏱️ Time: 10-15 minutes
- 💰 Cost: Depends on hosting
- 🔧 Maintenance: Medium

### 3️⃣ Traditional VPS
**DigitalOcean, AWS EC2, Linode** - Full control
- ⏱️ Time: 20-30 minutes
- 💰 Cost: $5-20/month
- 🔧 Maintenance: Manual

---

## 🚀 Method 1: Railway (Easiest)

### Step 1: Prepare Your Code
```bash
# Make sure .env has your API key
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY
```

### Step 2: Deploy to Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables:
   - `ANTHROPIC_API_KEY` = your key
   - `AI_PROVIDER` = anthropic
   - `NODE_ENV` = production
6. Click "Deploy"

### Step 3: Access Your App
- Railway will give you a URL like: `your-app.railway.app`
- Open it in your browser!

**Done!** ✅

---

## 🐳 Method 2: Docker (Local or Server)

### Step 1: Install Docker
```bash
# macOS
brew install docker

# Or download from: https://www.docker.com/products/docker-desktop
```

### Step 2: Build and Run
```bash
# Build the image
docker build -t postgres-query-tuner .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your_key_here \
  -e AI_PROVIDER=anthropic \
  --name query-tuner \
  postgres-query-tuner

# Check if running
docker ps

# View logs
docker logs query-tuner
```

### Step 3: Access Your App
- Open http://localhost:3000

**Or use Docker Compose:**
```bash
# Create .env file with your keys
cp .env.example .env

# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Done!** ✅

---

## 🖥️ Method 3: VPS (DigitalOcean Example)

### Step 1: Create Droplet
1. Go to https://digitalocean.com
2. Create account
3. Create Droplet:
   - Ubuntu 22.04
   - Basic plan ($6/month)
   - Choose datacenter region
   - Add SSH key

### Step 2: Connect to Server
```bash
ssh root@your-server-ip
```

### Step 3: Install Node.js
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify
node --version
npm --version
```

### Step 4: Install PM2
```bash
npm install -g pm2
```

### Step 5: Upload Your Code
```bash
# On your local machine
scp -r my-website root@your-server-ip:/root/

# Or use git
ssh root@your-server-ip
cd /root
git clone your-repo-url my-website
```

### Step 6: Setup Application
```bash
cd /root/my-website
npm install --production

# Create .env
nano .env
# Add your API keys, then save (Ctrl+X, Y, Enter)
```

### Step 7: Start with PM2
```bash
pm2 start server.js --name query-tuner
pm2 save
pm2 startup
```

### Step 8: Configure Firewall
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### Step 9: Setup Nginx (Optional)
```bash
apt install nginx

# Create config
nano /etc/nginx/sites-available/query-tuner
```

Add this:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/query-tuner /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 10: Access Your App
- Open http://your-server-ip
- Or http://your-domain.com (if configured)

**Done!** ✅

---

## 🤖 Method 4: Automated Deployment Script

### Use the Deploy Script
```bash
# Make executable
chmod +x deploy.sh

# Run
./deploy.sh

# Choose your deployment method from menu
```

The script will guide you through:
1. Docker deployment
2. Docker Compose deployment
3. PM2 deployment
4. Heroku deployment

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] `.env` file has your API key
- [ ] `ANTHROPIC_API_KEY` is set correctly
- [ ] `AI_PROVIDER` is set to "anthropic"
- [ ] Dependencies are installed (`npm install`)
- [ ] Application runs locally (`npm start`)
- [ ] Port 3000 is accessible
- [ ] `.gitignore` includes `.env`

---

## 🔐 Security Checklist

After deploying:

- [ ] Change default passwords
- [ ] Enable firewall
- [ ] Setup SSL/HTTPS
- [ ] Use environment variables for secrets
- [ ] Enable automatic security updates
- [ ] Setup monitoring
- [ ] Configure backups

---

## 🧪 Testing Your Deployment

### Test 1: Health Check
```bash
curl http://your-domain.com/health
# Should return: {"status":"ok",...}
```

### Test 2: Query Tuner
1. Open http://your-domain.com/query-tuner.html
2. Click "Load Sample"
3. Click "Analyze & Optimize"
4. Should see AI analysis results

### Test 3: API Endpoint
```bash
curl -X POST http://your-domain.com/api/analyze-query \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT * FROM users"}'
```

---

## 📊 Monitoring Your App

### PM2 Monitoring
```bash
pm2 status
pm2 logs query-tuner
pm2 monit
```

### Docker Monitoring
```bash
docker ps
docker logs query-tuner
docker stats query-tuner
```

### Check Resource Usage
```bash
# CPU and Memory
top

# Disk space
df -h

# Network
netstat -tuln | grep 3000
```

---

## 🆘 Common Issues

### Issue: "Port already in use"
```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Issue: "Cannot connect to server"
```bash
# Check if app is running
pm2 status
# or
docker ps

# Check firewall
ufw status

# Check logs
pm2 logs
# or
docker logs query-tuner
```

### Issue: "API key not working"
```bash
# Verify .env file
cat .env

# Restart application
pm2 restart query-tuner
# or
docker restart query-tuner
```

---

## 💡 Pro Tips

1. **Use a Domain Name**
   - Buy from Namecheap, GoDaddy, etc.
   - Point to your server IP
   - Setup SSL with Let's Encrypt

2. **Enable HTTPS**
   ```bash
   apt install certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

3. **Setup Monitoring**
   - Use PM2 monitoring
   - Setup UptimeRobot for uptime checks
   - Configure error alerts

4. **Backup Regularly**
   ```bash
   # Backup application
   tar -czf backup.tar.gz /root/my-website
   
   # Backup database (if using)
   pg_dump dbname > backup.sql
   ```

5. **Update Regularly**
   ```bash
   # Update system
   apt update && apt upgrade
   
   # Update Node.js packages
   npm update
   
   # Restart app
   pm2 restart query-tuner
   ```

---

## 🎉 You're Live!

Your PostgreSQL Query Tuner is now hosted and accessible to the world!

**Next Steps:**
1. Share your URL with your team
2. Monitor performance and logs
3. Setup SSL for security
4. Configure custom domain
5. Enable monitoring and alerts

**Need Help?**
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions
- Review [DEBUG_STATUS.md](DEBUG_STATUS.md) for troubleshooting
- See [README.md](README.md) for features and usage

---

**Happy Hosting! 🚀**
