// MCP Integration for Query Tuner
// This module provides integration with PostgreSQL MCP server when available

class MCPIntegration {
  constructor() {
    this.mcpAvailable = false;
    this.checkMCPAvailability();
  }

  async checkMCPAvailability() {
    try {
      const response = await fetch('/api/mcp/status');
      const data = await response.json();
      this.mcpAvailable = data.available;
      return this.mcpAvailable;
    } catch (error) {
      console.log('MCP not available, using standard analysis');
      this.mcpAvailable = false;
      return false;
    }
  }

  async listTables() {
    if (!this.mcpAvailable) {
      throw new Error('MCP not available');
    }

    const response = await fetch('/api/mcp/list-tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    return await response.json();
  }

  async describeTable(tableName) {
    if (!this.mcpAvailable) {
      throw new Error('MCP not available');
    }

    const response = await fetch('/api/mcp/describe-table', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName })
    });

    return await response.json();
  }

  async explainQuery(query) {
    if (!this.mcpAvailable) {
      throw new Error('MCP not available');
    }

    const response = await fetch('/api/mcp/explain-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    return await response.json();
  }

  async getTableStats(tableName) {
    if (!this.mcpAvailable) {
      throw new Error('MCP not available');
    }

    const response = await fetch('/api/mcp/table-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName })
    });

    return await response.json();
  }

  async analyzeQueryWithMCP(query) {
    try {
      // Get EXPLAIN ANALYZE output
      const explainResult = await this.explainQuery(query);
      
      // Extract table names from query
      const tables = this.extractTableNames(query);
      
      // Get statistics for each table
      const tableStats = await Promise.all(
        tables.map(table => this.getTableStats(table).catch(() => null))
      );

      return {
        explainPlan: explainResult.plan,
        tableStats: tableStats.filter(s => s !== null),
        executionTime: explainResult.executionTime,
        planningTime: explainResult.planningTime
      };
    } catch (error) {
      console.error('MCP analysis failed:', error);
      throw error;
    }
  }

  extractTableNames(query) {
    // Simple regex to extract table names from FROM and JOIN clauses
    const fromMatch = query.match(/FROM\s+(\w+)/gi) || [];
    const joinMatch = query.match(/JOIN\s+(\w+)/gi) || [];
    
    const tables = [...fromMatch, ...joinMatch]
      .map(match => match.replace(/FROM\s+|JOIN\s+/gi, '').trim())
      .filter((table, index, self) => self.indexOf(table) === index);
    
    return tables;
  }
}

// Export for use in tuner.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MCPIntegration;
}
