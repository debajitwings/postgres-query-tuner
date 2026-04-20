# Deployment Guide

Complete guide to compile, build, and host your PostgreSQL Query Tuner application.

## 📦 Table of Contents

1. [Local Development](#local-development)
2. [Production Build](#production-build)
3. [Deployment Options](#deployment-options)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Hosting](#cloud-hosting)
6. [Environment Configuration](#environment-configuration)

---

## 🏠 Local Development

### Current Setup (Already Working)
```bash
# Your app is already running locally
npm start
# Access at: http://localhost:3000
```

### For Fresh Setup
```bash
# Clone or download the project
cd my-website

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm start
```

---

## 🔨 Production Build

This is a Node.js application that doesn't require compilation, but here's how to prepare it for production:

### Step 1: Optimize Dependencies
```bash
# Install only production dependencies
npm install --production

# Or clean install
rm -rf node_modules
npm ci --production
```

### Step 2: Environment Configuration
```bash
# Create production .env
cat > .env << EOF
NODE_ENV=production
PORT=3000
ANTHROPIC_API_KEY=your_production_key_here
AI_PROVIDER=anthropic
EOF
```

### Step 3: Test Production Build
```bash
NODE_ENV=production npm start
```

---

## 🚀 Deployment Options

### Option 1: Traditional VPS (DigitalOcean, Linode, AWS EC2)

#### Prerequisites
- Ubuntu/Debian server
- SSH access
- Domain name (optional)

#### Deployment Steps

**1. Connect to Server**
```bash
ssh user@your-server-ip
```

**2. Install Node.js**
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

**3. Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

**4. Upload Your Code**
```bash
# On your local machine
scp -r my-website user@your-server-ip:/home/user/

# Or use git
ssh user@your-server-ip
cd /home/user
git clone your-repo-url my-website
```

**5. Setup Application**
```bash
cd /home/user/my-website
npm install --production

# Create .env file
nano .env
# Add your production API keys
```

**6. Start with PM2**
```bash
pm2 start server.js --name "query-tuner"
pm2 save
pm2 startup
```

**7. Configure Nginx (Reverse Proxy)**
```bash
sudo apt-get install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/query-tuner
```

Add this configuration:
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
sudo ln -s /etc/nginx/sites-available/query-tuner /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**8. Setup SSL (Optional but Recommended)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 2: Docker Deployment

#### Create Dockerfile
```bash
# I'll create this for you
```

**Dockerfile:**
```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  query-tuner:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - AI_PROVIDER=anthropic
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

**.dockerignore:**
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
*.md
.DS_Store
```

#### Build and Run
```bash
# Build image
docker build -t query-tuner .

# Run container
docker run -d \
  -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your_key \
  --name query-tuner \
  query-tuner

# Or use docker-compose
docker-compose up -d
```

---

### Option 3: Heroku

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### Deployment Steps

**1. Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

**2. Login to Heroku**
```bash
heroku login
```

**3. Create Heroku App**
```bash
cd my-website
heroku create your-app-name
```

**4. Set Environment Variables**
```bash
heroku config:set ANTHROPIC_API_KEY=your_key_here
heroku config:set AI_PROVIDER=anthropic
heroku config:set NODE_ENV=production
```

**5. Create Procfile**
```bash
echo "web: node server.js" > Procfile
```

**6. Deploy**
```bash
git init
git add .
git commit -m "Initial deployment"
git push heroku main
```

**7. Open App**
```bash
heroku open
```

---

### Option 4: Vercel (Serverless)

#### Prerequisites
- Vercel account
- Vercel CLI

#### Setup

**1. Install Vercel CLI**
```bash
npm install -g vercel
```

**2. Create vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**3. Deploy**
```bash
vercel
# Follow prompts
# Add environment variables in Vercel dashboard
```

---

### Option 5: AWS (Elastic Beanstalk)

#### Prerequisites
- AWS account
- EB CLI installed

#### Deployment Steps

**1. Install EB CLI**
```bash
pip install awsebcli
```

**2. Initialize EB**
```bash
cd my-website
eb init -p node.js-18 query-tuner
```

**3. Create Environment**
```bash
eb create production-env
```

**4. Set Environment Variables**
```bash
eb setenv ANTHROPIC_API_KEY=your_key AI_PROVIDER=anthropic
```

**5. Deploy**
```bash
eb deploy
```

**6. Open Application**
```bash
eb open
```

---

### Option 6: Railway

#### Deployment Steps

**1. Go to Railway.app**
- Sign up at https://railway.app

**2. Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Connect your repository

**3. Configure Environment**
- Add environment variables in Railway dashboard:
  - `ANTHROPIC_API_KEY`
  - `AI_PROVIDER`
  - `NODE_ENV=production`

**4. Deploy**
- Railway automatically deploys
- Get your public URL

---

### Option 7: Render

#### Deployment Steps

**1. Go to Render.com**
- Sign up at https://render.com

**2. Create Web Service**
- Click "New +"
- Select "Web Service"
- Connect GitHub repository

**3. Configure**
- Build Command: `npm install`
- Start Command: `node server.js`
- Add environment variables

**4. Deploy**
- Click "Create Web Service"
- Wait for deployment

---

## 🔐 Environment Configuration

### Production .env Template
```env
# Production Environment
NODE_ENV=production
PORT=3000

# AI Configuration
ANTHROPIC_API_KEY=sk-ant-your-production-key
AI_PROVIDER=anthropic
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Optional: PostgreSQL (if using MCP)
POSTGRES_CONNECTION_STRING=postgresql://user:pass@host:5432/db

# Optional: Logging
LOG_LEVEL=info
```

### Security Best Practices

**1. Never Commit Secrets**
```bash
# Ensure .gitignore includes:
.env
.env.local
.env.production
*.key
*.pem
```

**2. Use Environment Variables**
```bash
# Set in hosting platform, not in code
export ANTHROPIC_API_KEY=your_key
```

**3. Enable HTTPS**
```bash
# Use Let's Encrypt or cloud provider SSL
```

**4. Set Security Headers**
Add to server.js:
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

## 📊 Monitoring & Maintenance

### PM2 Monitoring
```bash
# View logs
pm2 logs query-tuner

# Monitor resources
pm2 monit

# Restart app
pm2 restart query-tuner

# View status
pm2 status
```

### Docker Monitoring
```bash
# View logs
docker logs query-tuner

# View stats
docker stats query-tuner

# Restart container
docker restart query-tuner
```

### Health Check Endpoint
Add to server.js:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to server
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        SERVER_IP: ${{ secrets.SERVER_IP }}
      run: |
        echo "$SSH_PRIVATE_KEY" > key.pem
        chmod 600 key.pem
        scp -i key.pem -r * user@$SERVER_IP:/app/
        ssh -i key.pem user@$SERVER_IP "cd /app && npm install && pm2 restart query-tuner"
```

---

## 📝 Deployment Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] API keys added to production .env
- [ ] Security headers enabled
- [ ] HTTPS/SSL configured
- [ ] Domain name configured (if applicable)
- [ ] Firewall rules set
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Error logging configured
- [ ] Health check endpoint working
- [ ] Load testing completed
- [ ] Documentation updated

---

## 🎯 Recommended Hosting

### For Beginners
- **Railway** - Easiest, automatic deployments
- **Render** - Simple, free tier available
- **Heroku** - Well-documented, easy to use

### For Production
- **AWS EC2 + PM2** - Full control, scalable
- **Docker + DigitalOcean** - Containerized, reliable
- **AWS Elastic Beanstalk** - Managed, scalable

### For Serverless
- **Vercel** - Fast, global CDN
- **AWS Lambda** - Pay per use

---

## 💰 Cost Estimates

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| Railway | $5 credit | $5-20/month |
| Render | Yes | $7-25/month |
| Heroku | Limited | $7-25/month |
| DigitalOcean | No | $5-40/month |
| AWS EC2 | 12 months | $5-50/month |
| Vercel | Yes | $20/month |

---

## 🆘 Troubleshooting

### Issue: Port already in use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

### Issue: Module not found
```bash
npm install
```

### Issue: Permission denied
```bash
sudo chown -R $USER:$USER /app
```

### Issue: Out of memory
```bash
# Increase Node.js memory
node --max-old-space-size=4096 server.js
```

---

## 📚 Additional Resources

- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

**Ready to deploy?** Choose your hosting option and follow the steps above!
