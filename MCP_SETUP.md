# PostgreSQL MCP Server Setup Guide

This guide will help you set up the PostgreSQL MCP (Model Context Protocol) server for real database analysis in Kiro.

## Prerequisites

✅ Python 3.11+ installed
✅ `uv` package manager installed
✅ PostgreSQL database running

## Step 1: Configure Database Connection

Edit `.kiro/settings/mcp.json` and update the connection string:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "/Users/debajitc/.local/bin/uvx",
      "args": ["mcp-server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://username:password@localhost:5432/database_name"
      },
      "disabled": false,
      "autoApprove": [
        "query",
        "list_tables",
        "describe_table",
        "get_table_info"
      ]
    }
  }
}
```

### Connection String Format:
```
postgresql://[username]:[password]@[host]:[port]/[database]
```

**Examples:**
- Local: `postgresql://postgres:mypassword@localhost:5432/mydb`
- Remote: `postgresql://user:pass@db.example.com:5432/production`
- With SSL: `postgresql://user:pass@host:5432/db?sslmode=require`

## Step 2: Test PostgreSQL Connection

Before using MCP, verify your PostgreSQL is running:

```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Or connect to your database
psql -U your_username -d your_database
```

## Step 3: Verify MCP Server Installation

The MCP server will be automatically downloaded when Kiro first connects. You can verify it's available:

```bash
~/.local/bin/uvx mcp-server-postgres --help
```

## Step 4: Using MCP in Kiro

### Option A: Through Kiro IDE

1. Open Kiro
2. The MCP server will connect automatically
3. Use the command palette: "MCP: List Servers" to verify connection
4. Available MCP tools will appear in your context

### Option B: Through Query Tuner Application

The query tuner can now:
- Connect to your real database
- Run EXPLAIN ANALYZE on actual queries
- Get real execution plans
- Analyze actual table statistics

## Available MCP Tools

Once connected, you'll have access to:

- `query` - Execute SQL queries (read-only recommended)
- `list_tables` - List all tables in the database
- `describe_table` - Get table schema and column info
- `get_table_info` - Get table statistics and indexes
- `explain_query` - Run EXPLAIN ANALYZE on queries

## Security Best Practices

1. **Use Read-Only User**: Create a dedicated read-only database user for MCP:

```sql
CREATE USER mcp_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE your_database TO mcp_readonly;
GRANT USAGE ON SCHEMA public TO mcp_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mcp_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO mcp_readonly;
```

2. **Use Environment Variables**: Don't commit credentials to git:

```bash
# Add to .env
POSTGRES_CONNECTION_STRING=postgresql://user:pass@localhost:5432/db
```

3. **Enable SSL**: For remote connections, always use SSL:

```
postgresql://user:pass@host:5432/db?sslmode=require
```

## Troubleshooting

### MCP Server Not Connecting

1. Check PostgreSQL is running:
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. Verify connection string:
   ```bash
   psql "postgresql://user:pass@localhost:5432/db"
   ```

3. Check Kiro logs in the MCP Server view

### Permission Denied

Ensure your database user has proper permissions:
```sql
GRANT SELECT ON ALL TABLES IN SCHEMA public TO your_user;
```

### uvx Command Not Found

Add to your PATH:
```bash
export PATH="$HOME/.local/bin:$PATH"
```

Add to `~/.zshrc` or `~/.bash_profile` to make permanent.

## Example Usage in Kiro

Once MCP is set up, you can ask Kiro:

- "List all tables in my database"
- "Describe the users table schema"
- "Run EXPLAIN ANALYZE on this query: SELECT * FROM orders WHERE status = 'pending'"
- "What indexes exist on the products table?"
- "Analyze the performance of this query"

## Integration with Query Tuner

The query tuner will automatically use MCP when available to:
1. Get real EXPLAIN ANALYZE output
2. Check actual table statistics
3. Verify index usage
4. Provide database-specific recommendations

## Next Steps

1. Configure your connection string in `.kiro/settings/mcp.json`
2. Restart Kiro or reload the MCP server
3. Test with: "List tables in my database"
4. Use the Query Tuner with real database analysis!

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [PostgreSQL MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
