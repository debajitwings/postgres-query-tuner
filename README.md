# Student Admission System

A comprehensive application suite with student admission portal, PostgreSQL log analyzer, and AI-powered query tuner.

## 🚀 Quick Start

**New here?** See [QUICK_START.md](QUICK_START.md) for a 5-minute setup guide!

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure AI API keys (for Query Tuner):
```bash
cp .env.example .env
# Edit .env and add your API keys:
# - ANTHROPIC_API_KEY for Claude
# - OPENAI_API_KEY for GPT-4
# - Set AI_PROVIDER to 'anthropic' or 'openai'
```

3. (Optional) Set up PostgreSQL MCP Server for real database analysis:
```bash
# See MCP_SETUP.md for detailed instructions
# Edit .kiro/settings/mcp.json with your database connection
```

4. Start the server:
```bash
npm start
```

3. Open the applications:
   - Student Admission: http://localhost:3000/admission.html
   - PostgreSQL Log Analyzer: http://localhost:3000/log-analyzer.html
   - PostgreSQL Query Tuner: http://localhost:3000/query-tuner.html

## Features

### Student Admission Portal
- Submit student applications
- View all applications
- Update application status (pending/approved/rejected)

### PostgreSQL Log Analyzer
- Upload PostgreSQL error log files (.log, .txt)
- Automatic issue detection and categorization
- Severity classification (Critical, Warning, Info)
- Detailed recommendations for each issue
- Sample log for testing
- Detects: missing tables, deadlocks, syntax errors, connection issues, memory problems

### PostgreSQL Query Tuner & Optimizer (AI-Powered)
- **AI-powered analysis** using Claude 3.5 Sonnet or GPT-4
- Intelligent SQL query analysis and optimization
- Detects bottlenecks: sequential scans, missing indexes, inefficient joins
- Query rewriting with PostgreSQL best practices
- Before/after comparison with execution plan analysis
- Section-by-section tuning trace showing what changed and why
- Wait events analysis (CPU, I/O, locks)
- Index recommendations and creation scripts
- Performance metrics: cost reduction, time improvement
- Detects: SELECT *, missing WHERE, OR conditions, function on indexed columns, NOT IN subqueries
- Recommendations: covering indexes, statistics updates, partitioning, connection pooling
- **Fallback to rule-based analysis** if AI is unavailable
- Supports EXPLAIN ANALYZE output for deeper insights

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[COMPILE_AND_HOST.md](COMPILE_AND_HOST.md)** - How to host and deploy
- **[HOSTING_QUICK_START.md](HOSTING_QUICK_START.md)** - Quick hosting guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Detailed deployment options
- **[MCP_SETUP.md](MCP_SETUP.md)** - PostgreSQL MCP server configuration
- **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Verification checklist
- **[DEBUG_STATUS.md](DEBUG_STATUS.md)** - Current status and debugging
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete overview

## 🔧 Advanced Setup

### PostgreSQL MCP Integration

For real database analysis with actual EXPLAIN plans:

```bash
# Automated setup
./setup-mcp.sh

# Or see MCP_SETUP.md for manual configuration
```

### API Keys

Get your API keys:
- **Claude**: https://console.anthropic.com/
- **GPT-4**: https://platform.openai.com/api-keys

## 🎯 Usage

### Query Tuner Examples

1. **Basic Analysis**: Paste any SQL query and click "Analyze"
2. **With EXPLAIN**: Add EXPLAIN output for deeper insights
3. **With MCP**: Use Kiro IDE for real database analysis

### In Kiro IDE

Ask Kiro:
- "List all tables in my database"
- "Analyze this query performance"
- "What indexes should I create?"
- "Run EXPLAIN on this query"

## 🛠️ Troubleshooting

See [QUICK_START.md](QUICK_START.md#troubleshooting) for common issues and solutions.

## 📦 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **AI**: Claude 3.5 Sonnet / GPT-4
- **Database**: PostgreSQL (via MCP)
- **Tools**: MCP (Model Context Protocol)
