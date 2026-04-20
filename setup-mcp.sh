#!/bin/bash

echo "🚀 PostgreSQL MCP Server Setup"
echo "================================"
echo ""

# Check if uv is installed
if ! command -v uvx &> /dev/null; then
    echo "❌ uvx not found. Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
    echo "✅ uv installed successfully"
else
    echo "✅ uvx is already installed"
fi

echo ""
echo "📝 PostgreSQL Connection Setup"
echo "================================"
echo ""

# Prompt for database connection details
read -p "Enter PostgreSQL host (default: localhost): " PG_HOST
PG_HOST=${PG_HOST:-localhost}

read -p "Enter PostgreSQL port (default: 5432): " PG_PORT
PG_PORT=${PG_PORT:-5432}

read -p "Enter database name: " PG_DATABASE

read -p "Enter username: " PG_USER

read -sp "Enter password: " PG_PASSWORD
echo ""

# Build connection string
CONNECTION_STRING="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}"

echo ""
echo "🔧 Creating MCP configuration..."

# Create .kiro directory if it doesn't exist
mkdir -p .kiro/settings

# Create mcp.json with the connection string
cat > .kiro/settings/mcp.json << EOF
{
  "mcpServers": {
    "postgres": {
      "command": "$HOME/.local/bin/uvx",
      "args": ["mcp-server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${CONNECTION_STRING}"
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
EOF

echo "✅ MCP configuration created at .kiro/settings/mcp.json"
echo ""

# Test connection
echo "🧪 Testing PostgreSQL connection..."
if command -v psql &> /dev/null; then
    if psql "${CONNECTION_STRING}" -c "SELECT version();" &> /dev/null; then
        echo "✅ PostgreSQL connection successful!"
    else
        echo "⚠️  Could not connect to PostgreSQL. Please verify your credentials."
    fi
else
    echo "⚠️  psql not found. Skipping connection test."
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Open Kiro IDE"
echo "2. The PostgreSQL MCP server will connect automatically"
echo "3. Use the Query Tuner with real database analysis!"
echo ""
echo "To verify MCP is working in Kiro:"
echo "  - Open command palette"
echo "  - Search for 'MCP: List Servers'"
echo "  - You should see 'postgres' listed"
echo ""
echo "For more details, see MCP_SETUP.md"
