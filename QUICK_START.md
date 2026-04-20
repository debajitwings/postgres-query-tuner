# Quick Start Guide

Get up and running with the PostgreSQL Query Tuner in 3 easy steps!

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Choose Your Setup

#### Option A: AI-Powered Analysis Only (Recommended for Quick Start)

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your API key
# For Claude (recommended):
ANTHROPIC_API_KEY=sk-ant-your-key-here
AI_PROVIDER=anthropic

# Start the server
npm start
```

Open: http://localhost:3000/query-tuner.html

#### Option B: Full Setup with Real Database (Advanced)

```bash
# Run the automated setup script
./setup-mcp.sh

# This will:
# - Install uv (Python package manager)
# - Configure PostgreSQL MCP server
# - Test your database connection
# - Set up Kiro integration

# Then start the server
npm start
```

### Step 3: Test It Out!

1. Open http://localhost:3000/query-tuner.html
2. Click "Load Sample" to see a demo query
3. Click "Analyze & Optimize"
4. See AI-powered recommendations!

## 📚 What You Get

### 1. Student Admission Portal
http://localhost:3000/admission.html
- Submit and manage student applications
- Simple CRUD operations

### 2. PostgreSQL Log Analyzer
http://localhost:3000/log-analyzer.html
- Upload PostgreSQL error logs
- Get instant issue detection
- Receive actionable recommendations

### 3. Query Tuner (AI-Powered)
http://localhost:3000/query-tuner.html
- Paste any SQL query
- Get AI analysis from Claude/GPT-4
- See optimized query rewrite
- View execution plan analysis
- Get index recommendations

## 🔑 Getting API Keys

### Claude (Anthropic) - Recommended
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Create new key
5. Copy key (starts with `sk-ant-`)

### GPT-4 (OpenAI) - Alternative
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Create new key
5. Copy key (starts with `sk-`)

## 🗄️ PostgreSQL MCP Setup (Optional)

For real database analysis with actual EXPLAIN plans:

### Prerequisites
- PostgreSQL database running
- Database credentials
- Python 3.11+ installed

### Automated Setup
```bash
./setup-mcp.sh
```

### Manual Setup
See [MCP_SETUP.md](MCP_SETUP.md) for detailed instructions.

## 🎯 Usage Examples

### Example 1: Analyze a Slow Query

```sql
SELECT * FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
ORDER BY o.created_at DESC;
```

**What you'll get:**
- Issues detected (SELECT *, missing indexes)
- Optimized query rewrite
- Index creation scripts
- Performance improvement estimates

### Example 2: With EXPLAIN Output

1. Run in your database:
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM orders WHERE status = 'pending';
```

2. Paste the JSON output in the "EXPLAIN Output" field
3. Get detailed analysis of actual execution

### Example 3: Using MCP (in Kiro)

Ask Kiro:
- "List all tables in my database"
- "Analyze this query: SELECT * FROM users"
- "What indexes exist on the orders table?"
- "Run EXPLAIN on my query"

## 🛠️ Troubleshooting

### AI Analysis Not Working

**Error: "No AI provider configured"**
- Check `.env` file exists
- Verify API key is set correctly
- Restart the server

**Error: "Invalid API key"**
- Verify key is correct (no extra spaces)
- Check key has proper permissions
- Try regenerating the key

### MCP Not Connecting

**Check PostgreSQL is running:**
```bash
pg_isready -h localhost -p 5432
```

**Test connection manually:**
```bash
psql "postgresql://user:pass@localhost:5432/db"
```

**Verify uvx is installed:**
```bash
uvx --version
```

### Port Already in Use

If port 3000 is busy:
```bash
# Edit server.js and change PORT to 3001
# Or kill the process using port 3000
lsof -ti:3000 | xargs kill
```

## 📖 Documentation

- [MCP Setup Guide](MCP_SETUP.md) - Detailed PostgreSQL MCP configuration
- [README.md](README.md) - Full feature documentation
- [.env.example](.env.example) - Configuration template

## 🤝 Support

Having issues? Check:
1. All dependencies installed: `npm install`
2. API keys configured in `.env`
3. Server is running: `npm start`
4. Check console for errors

## 🎉 You're Ready!

Start analyzing and optimizing your PostgreSQL queries with AI-powered insights!

```bash
npm start
# Open http://localhost:3000/query-tuner.html
```
