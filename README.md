# PostgreSQL Query Optimizer

An AI-powered PostgreSQL query analysis and optimization tool with a built-in log analyzer. Paste any SQL query, get instant performance insights, an optimized rewrite, index recommendations, execution plan visualization, and wait event analysis — all powered by Claude or GPT-4.

---

## Features

### Query Tuner & Optimizer
- AI-powered SQL analysis using Claude 3.5 Sonnet (via AWS Bedrock or Anthropic direct) or GPT-4
- Detects performance bottlenecks: sequential scans, missing indexes, inefficient joins, unbounded sorts
- Rewrites queries with PostgreSQL best practices applied
- Side-by-side before/after comparison with step-by-step tuning trace
- Estimated execution plan visualization (inferred from query structure or from EXPLAIN ANALYZE output)
- Wait event analysis: I/O, CPU, lock, and memory waits
- Index creation scripts with covering index recommendations
- Performance metrics: estimated cost reduction and execution time improvement
- Rule-based fallback analysis when no AI provider is configured

### PostgreSQL Log Analyzer
- Upload `.log` or `.txt` PostgreSQL server log files
- Automatic issue detection and severity classification (Critical / Warning / Info)
- Detects: missing tables/relations, deadlocks, syntax errors, connection limit errors, memory warnings, missing columns
- Actionable fix recommendations for each detected issue
- Built-in sample log for quick testing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 14 |
| Web Framework | Express 4 |
| Frontend | Vanilla HTML, CSS, JavaScript |
| AI — Primary | AWS Bedrock (`@aws-sdk/client-bedrock-runtime`) |
| AI — Alternate | Anthropic API (Claude 3.5 Sonnet) via `axios` |
| AI — Alternate | OpenAI API (GPT-4 Turbo) via `axios` |
| Config | `dotenv` |
| CORS | `cors` |
| Containerization | Docker + Docker Compose |
| Deployment | Heroku (`Procfile`), Vercel (`vercel.json`) |
| Database (optional) | PostgreSQL via MCP (Model Context Protocol) |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and configure your preferred AI provider:

**Option A — AWS Bedrock (recommended)**
```env
AI_PROVIDER=bedrock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
BEDROCK_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
```

**Option B — Anthropic direct API**
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

**Option C — OpenAI**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4-turbo-preview
```

### 3. Start the server

```bash
npm start
```

The server starts on `http://localhost:3000` by default.

| Tool | URL |
|---|---|
| Query Tuner | http://localhost:3000/query-tuner.html |
| Log Analyzer | http://localhost:3000/log-analyzer.html |

---

## AI Provider Details

### AWS Bedrock
The default and recommended provider. Uses the `@aws-sdk/client-bedrock-runtime` SDK. Credentials are read from environment variables or from `~/.aws/credentials` if running locally with the AWS CLI configured.

Supported Bedrock models:
- `anthropic.claude-3-5-sonnet-20241022-v2:0` — recommended
- `anthropic.claude-3-5-haiku-20241022-v1:0` — faster, lower cost
- `anthropic.claude-3-opus-20240229-v1:0` — highest capability

Get access: [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)

### Anthropic Direct
Calls `https://api.anthropic.com/v1/messages` directly. Requires an API key from [console.anthropic.com](https://console.anthropic.com/).

### OpenAI
Calls `https://api.openai.com/v1/chat/completions`. Requires an API key from [platform.openai.com](https://platform.openai.com/api-keys).

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze-query` | Submit a SQL query (and optional EXPLAIN plan) for AI analysis |
| `GET` | `/api/mcp/status` | Check MCP/PostgreSQL connection status |
| `GET` | `/health` | Server health check |

### `/api/analyze-query` request body

```json
{
  "query": "SELECT * FROM orders WHERE user_id = 1",
  "explainPlan": "(optional) paste EXPLAIN ANALYZE output here"
}
```

### Response structure

```json
{
  "success": true,
  "provider": "bedrock",
  "timestamp": "2026-05-04T10:00:00.000Z",
  "analysis": {
    "issues": [...],
    "optimizations": [...],
    "optimizedQuery": "...",
    "recommendations": [...],
    "waitEvents": [...],
    "executionPlan": [...],
    "metrics": {
      "estimatedCostReduction": "65%",
      "estimatedTimeImprovement": "3.2x faster",
      "confidence": "high"
    }
  }
}
```

---

## What the Optimizer Detects

| Issue | Severity |
|---|---|
| `SELECT *` — retrieves unnecessary columns | Warning |
| Missing `WHERE` clause — full table scan | Critical |
| `OR` conditions that prevent index usage | Warning |
| Functions applied to indexed columns in `WHERE` | Critical |
| `NOT IN` subqueries — use `NOT EXISTS` instead | Warning |
| Implicit cross joins (comma-separated tables) | Warning |
| `ORDER BY` without `LIMIT` — unbounded sort | Info |

---

## Optimization Output

For each detected issue the optimizer produces:

- **Tuning trace** — numbered steps showing exactly what changed and why
- **Optimized query** — a complete rewrite with best practices applied
- **Index recommendations** — `CREATE INDEX` statements with covering index support
- **Execution plan** — visual node tree (inferred or from EXPLAIN ANALYZE)
- **Wait events** — I/O, CPU, lock, and memory wait analysis with solutions
- **Statistics commands** — `ANALYZE` statements to keep planner stats fresh
- **Partitioning guidance** — when time-based partitioning would help
- **Connection pooling config** — PgBouncer example when connection limits are a concern

---

## PostgreSQL MCP Integration (Optional)

For live database analysis using real `EXPLAIN` plans, connect a PostgreSQL MCP server through Kiro IDE.

```bash
# Automated setup
./setup-mcp.sh

# Or configure manually — see MCP_SETUP.md
```

Add your connection string to `.env`:

```env
POSTGRES_CONNECTION_STRING=postgresql://user:password@localhost:5432/mydb
```

Once connected, you can ask Kiro:
- "List all tables in my database"
- "Run EXPLAIN ANALYZE on this query"
- "What indexes exist on the orders table?"
- "Show table statistics for users"

---

## Docker

```bash
# Build and run with Docker Compose
npm run docker:compose

# Or build and run manually
npm run docker:build
npm run docker:run

# Stop
npm run docker:stop
```

---

## Deployment

### Heroku
```bash
heroku create your-app-name
heroku config:set AI_PROVIDER=bedrock
heroku config:set AWS_REGION=us-east-1
heroku config:set AWS_ACCESS_KEY_ID=...
heroku config:set AWS_SECRET_ACCESS_KEY=...
git push heroku main
```

### Vercel
```bash
vercel --prod
```

Set environment variables in the Vercel dashboard under Project → Settings → Environment Variables.

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for full deployment options.

---

## Project Structure

```
├── server.js           # Express server, API routes
├── ai-service.js       # AI provider abstraction (Bedrock / Anthropic / OpenAI)
├── query-tuner.html    # Query Tuner UI
├── tuner.js            # Query Tuner frontend logic
├── tuner-styles.css    # Query Tuner styles
├── log-analyzer.html   # Log Analyzer UI
├── analyzer.js         # Log Analyzer frontend logic
├── analyzer-styles.css # Log Analyzer styles
├── mcp-integration.js  # MCP/PostgreSQL integration helpers
├── .env.example        # Environment variable template
├── Dockerfile          # Container definition
├── docker-compose.yml  # Multi-container setup
├── vercel.json         # Vercel deployment config
└── Procfile            # Heroku process definition
```

---

## Documentation

- [QUICK_START.md](QUICK_START.md) — Get running in 5 minutes
- [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture overview
- [MCP_SETUP.md](MCP_SETUP.md) — PostgreSQL MCP server configuration
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — Full deployment options
- [COMPILE_AND_HOST.md](COMPILE_AND_HOST.md) — Build and hosting guide
- [DEBUG_STATUS.md](DEBUG_STATUS.md) — Debugging and status reference

---

## License

MIT

---

## Author

**Developed by Debajit Chandra**

© 2024-2026 Debajit Chandra. All rights reserved.
