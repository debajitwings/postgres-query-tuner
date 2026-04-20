# How to Compile and Host This Code

## 📝 Important Note

This is a **Node.js application** - it doesn't need compilation like Java or C++. Node.js code runs directly without a build step.

However, you do need to:
1. Install dependencies
2. Configure environment
3. Deploy to a server

---

## ⚡ Quick Answer

### To Run Locally (Already Working!)
```bash
npm install    # Install dependencies
npm start      # Start server
# Open: http://localhost:3000
```

### To Host Online
Choose one:
- **Easiest**: Railway, Render, Heroku (see below)
- **Docker**: `docker-compose up -d`
- **VPS**: Use deploy script `./deploy.sh`

---

## 🎯 Three Ways to Host

### 1. Cloud Platform (Easiest - 5 minutes)

#### Railway (Recommended)
```bash
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Add environment variable: ANTHROPIC_API_KEY
5. Done! Get your URL
```

#### Render
```bash
1. Go to https://render.com
2. Create "Web Service"
3. Connect GitHub repo
4. Build: npm install
5. Start: node server.js
6. Add environment variables
7. Deploy!
```

#### Heroku
```bash
heroku login
heroku create your-app-name
heroku config:set ANTHROPIC_API_KEY=your_key
git push heroku main
heroku open
```

---

### 2. Docker (10 minutes)

#### Using Docker
```bash
# Build image
docker build -t query-tuner .

# Run container
docker run -d -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your_key \
  --name query-tuner \
  query-tuner

# Access at http://localhost:3000
```

#### Using Docker Compose
```bash
# Create .env with your API key
cp .env.example .env
nano .env  # Add your key

# Start
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

---

### 3. VPS Server (30 minutes)

#### Quick VPS Setup
```bash
# 1. Get a server (DigitalOcean, AWS, etc.)

# 2. Connect
ssh root@your-server-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 4. Install PM2
npm install -g pm2

# 5. Upload code
git clone your-repo-url app
cd app

# 6. Install dependencies
npm install --production

# 7. Create .env
nano .env
# Add: ANTHROPIC_API_KEY=your_key

# 8. Start with PM2
pm2 start server.js --name query-tuner
pm2 save
pm2 startup

# 9. Access at http://your-server-ip:3000
```

---

## 🤖 Automated Deployment

### Use the Deploy Script
```bash
chmod +x deploy.sh
./deploy.sh
```

This interactive script helps you deploy with:
- Docker
- Docker Compose  
- PM2
- Heroku

---

## 📦 What Gets "Compiled"?

### Nothing! But here's what happens:

1. **Dependencies Installation**
   ```bash
   npm install
   # Downloads packages from npm registry
   ```

2. **Environment Configuration**
   ```bash
   # .env file with API keys
   ANTHROPIC_API_KEY=your_key
   ```

3. **Server Start**
   ```bash
   node server.js
   # Runs the Express server
   ```

That's it! No compilation needed.

---

## 🔧 Files Needed for Deployment

### Essential Files
```
✅ server.js          # Main application
✅ package.json       # Dependencies list
✅ .env              # API keys (create from .env.example)
✅ *.html            # Frontend pages
✅ *.css             # Stylesheets
✅ *.js              # Frontend scripts
```

### Deployment Files (Already Created)
```
✅ Dockerfile        # Docker configuration
✅ docker-compose.yml # Docker Compose setup
✅ Procfile          # Heroku configuration
✅ vercel.json       # Vercel configuration
✅ deploy.sh         # Deployment script
✅ .dockerignore     # Docker ignore rules
```

---

## 🌐 Hosting Options Comparison

| Platform | Difficulty | Time | Cost | Best For |
|----------|-----------|------|------|----------|
| Railway | ⭐ Easy | 5 min | Free tier | Beginners |
| Render | ⭐ Easy | 5 min | Free tier | Beginners |
| Heroku | ⭐⭐ Medium | 10 min | $7/mo | Quick deploy |
| Docker | ⭐⭐ Medium | 10 min | Varies | Consistency |
| VPS | ⭐⭐⭐ Hard | 30 min | $5/mo | Full control |

---

## 📋 Step-by-Step: Railway (Recommended)

### Step 1: Prepare Code
```bash
# Make sure you have .env with API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### Step 3: Deploy on Railway
1. Go to https://railway.app
2. Click "Login" → Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway will auto-detect Node.js

### Step 4: Add Environment Variables
1. Click on your project
2. Go to "Variables" tab
3. Add:
   - `ANTHROPIC_API_KEY` = your actual key
   - `AI_PROVIDER` = anthropic
   - `NODE_ENV` = production

### Step 5: Deploy
1. Railway automatically deploys
2. Wait for build to complete
3. Click "Generate Domain"
4. Get your public URL!

### Step 6: Test
1. Open your Railway URL
2. Add `/query-tuner.html` to the URL
3. Test the query analyzer

**Done!** Your app is live! 🎉

---

## 🔐 Security Before Hosting

### 1. Never Commit Secrets
```bash
# Make sure .gitignore includes:
.env
.env.local
.env.production
```

### 2. Use Environment Variables
```bash
# On hosting platform, set:
ANTHROPIC_API_KEY=your_key
AI_PROVIDER=anthropic
NODE_ENV=production
```

### 3. Enable HTTPS
- Most platforms (Railway, Render, Heroku) provide HTTPS automatically
- For VPS, use Let's Encrypt

---

## 🧪 Testing Your Deployment

### Test 1: Health Check
```bash
curl https://your-app-url.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-03-04T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### Test 2: Query Tuner
1. Open `https://your-app-url.com/query-tuner.html`
2. Click "Load Sample"
3. Click "Analyze & Optimize"
4. Should see AI-powered analysis

### Test 3: All Apps
- Student Admission: `/admission.html`
- Log Analyzer: `/log-analyzer.html`
- Query Tuner: `/query-tuner.html`

---

## 📊 Monitoring After Deployment

### Railway/Render/Heroku
- Check platform dashboard for logs
- Monitor resource usage
- Set up alerts

### Docker
```bash
docker logs query-tuner
docker stats query-tuner
```

### PM2 (VPS)
```bash
pm2 status
pm2 logs query-tuner
pm2 monit
```

---

## 🆘 Troubleshooting

### "Module not found"
```bash
npm install
```

### "Port already in use"
```bash
lsof -ti:3000 | xargs kill -9
```

### "API key not working"
```bash
# Check .env file
cat .env

# Restart app
pm2 restart query-tuner
# or
docker restart query-tuner
```

### "Cannot connect"
- Check firewall settings
- Verify port is open
- Check application logs

---

## 📚 Additional Resources

- **Quick Start**: [HOSTING_QUICK_START.md](HOSTING_QUICK_START.md)
- **Detailed Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Debug Help**: [DEBUG_STATUS.md](DEBUG_STATUS.md)
- **Setup Checklist**: [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)

---

## 🎯 Summary

### No Compilation Needed!
This is Node.js - just install dependencies and run.

### Easiest Way to Host:
1. Push code to GitHub
2. Deploy on Railway/Render
3. Add API key as environment variable
4. Done!

### Alternative Ways:
- Docker: `docker-compose up -d`
- VPS: `./deploy.sh`
- Heroku: `git push heroku main`

### Your App Will Be Live At:
- Railway: `your-app.railway.app`
- Render: `your-app.onrender.com`
- Heroku: `your-app.herokuapp.com`
- VPS: `http://your-server-ip:3000`

---

**Ready to host?** Choose a method above and follow the steps!

**Need help?** Check the detailed guides in the documentation folder.

**Questions?** Review [HOSTING_QUICK_START.md](HOSTING_QUICK_START.md) for step-by-step instructions.

🚀 **Happy Hosting!**
