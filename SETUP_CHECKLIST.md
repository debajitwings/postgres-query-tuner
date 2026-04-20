# Setup Checklist

Use this checklist to ensure everything is configured correctly.

## ✅ Basic Setup

- [ ] Node.js installed (check: `node --version`)
- [ ] npm installed (check: `npm --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts successfully (`npm start`)
- [ ] Can access http://localhost:3000

## ✅ AI Integration (Required for Query Tuner)

- [ ] `.env` file created (copy from `.env.example`)
- [ ] API key added to `.env` file
  - [ ] Option A: `ANTHROPIC_API_KEY` for Claude
  - [ ] Option B: `OPENAI_API_KEY` for GPT-4
- [ ] `AI_PROVIDER` set in `.env` (anthropic or openai)
- [ ] API key is valid (test with sample query)
- [ ] AI analysis returns results (not falling back to rules)

## ✅ PostgreSQL MCP Setup (Optional - Advanced)

- [ ] Python 3.11+ installed (check: `python3 --version`)
- [ ] `uv` installed (check: `uvx --version`)
- [ ] PostgreSQL database running (check: `pg_isready`)
- [ ] Database credentials available
- [ ] `.kiro/settings/` directory exists
- [ ] `mcp.json` configured with connection string
- [ ] Connection string tested (check: `psql "connection_string"`)
- [ ] MCP server can connect (check in Kiro IDE)

## ✅ Application Testing

### Student Admission Portal
- [ ] Can access http://localhost:3000/admission.html
- [ ] Can submit a new application
- [ ] Applications appear in the list
- [ ] Can update application status

### PostgreSQL Log Analyzer
- [ ] Can access http://localhost:3000/log-analyzer.html
- [ ] "Load Sample" button works
- [ ] Can upload a .log file
- [ ] Issues are detected and displayed
- [ ] Recommendations are shown

### Query Tuner
- [ ] Can access http://localhost:3000/query-tuner.html
- [ ] "Load Sample" button works
- [ ] Can paste custom SQL query
- [ ] "Analyze & Optimize" button works
- [ ] AI analysis completes successfully
- [ ] Optimized query is displayed
- [ ] Tuning steps are shown
- [ ] Recommendations are provided
- [ ] Can copy optimized query

## ✅ MCP Integration Testing (If Configured)

- [ ] MCP status indicator shows "Connected" in Kiro
- [ ] Can list tables from database
- [ ] Can describe table schema
- [ ] Can run EXPLAIN on queries
- [ ] Real execution plans are returned
- [ ] Table statistics are available

## 🔍 Verification Commands

### Check Node.js Setup
```bash
node --version  # Should be v14+
npm --version   # Should be v6+
```

### Check Dependencies
```bash
npm list --depth=0
# Should show: express, cors, dotenv, axios
```

### Check Python Setup (for MCP)
```bash
python3 --version  # Should be 3.11+
uvx --version      # Should show uv version
```

### Check PostgreSQL (for MCP)
```bash
pg_isready -h localhost -p 5432
psql "postgresql://user:pass@localhost:5432/db" -c "SELECT version();"
```

### Test API Endpoints
```bash
# Test server is running
curl http://localhost:3000

# Test admissions API
curl http://localhost:3000/api/admissions

# Test MCP status
curl http://localhost:3000/api/mcp/status
```

## 🐛 Troubleshooting

### Server Won't Start

**Error: "Cannot find module 'express'"**
```bash
npm install
```

**Error: "Port 3000 already in use"**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill
# Or change PORT in server.js
```

### AI Analysis Fails

**Error: "No AI provider configured"**
- Check `.env` file exists
- Verify API key is set
- Restart server after changing .env

**Error: "Invalid API key"**
- Verify key is correct (no spaces)
- Check key has proper permissions
- Try regenerating the key

**Falls back to rule-based analysis**
- This is normal if AI fails
- Check console for error messages
- Verify API key and provider settings

### MCP Not Working

**Error: "uvx: command not found"**
```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh
# Add to PATH
export PATH="$HOME/.local/bin:$PATH"
```

**Error: "Connection refused"**
- Check PostgreSQL is running
- Verify connection string
- Test with psql command

**MCP server not connecting in Kiro**
- Check `.kiro/settings/mcp.json` exists
- Verify connection string format
- Restart Kiro IDE
- Check Kiro MCP Server view for errors

## 📊 Success Indicators

You're all set when:

✅ Server starts without errors
✅ All three applications load in browser
✅ AI analysis returns optimized queries
✅ Sample queries work correctly
✅ No console errors in browser
✅ API endpoints respond correctly

## 🎯 Next Steps

Once everything is checked:

1. **Try the sample queries** in Query Tuner
2. **Upload a real log file** to Log Analyzer
3. **Test with your own SQL queries**
4. **Connect to your database** via MCP (optional)
5. **Read the documentation** for advanced features

## 📚 Additional Resources

- [QUICK_START.md](QUICK_START.md) - Fast setup guide
- [MCP_SETUP.md](MCP_SETUP.md) - Detailed MCP configuration
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Complete overview

## 🆘 Still Having Issues?

1. Check all items in this checklist
2. Review error messages in console
3. Verify all prerequisites installed
4. Try the troubleshooting steps
5. Check documentation files

## ✨ You're Ready!

If all items are checked, you're ready to start optimizing PostgreSQL queries with AI! 🚀

```bash
npm start
# Open http://localhost:3000/query-tuner.html
```
