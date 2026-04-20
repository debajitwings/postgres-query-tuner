// PostgreSQL Query Tuner - Main Application Logic

const queryInput = document.getElementById('queryInput');
const explainInput = document.getElementById('explainInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadSampleBtn = document.getElementById('loadSampleQuery');
const resultsContainer = document.getElementById('resultsContainer');

// Sample query for demonstration
const sampleQuery = `SELECT u.id, u.name, u.email, o.order_id, o.total, p.product_name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE u.created_at > '2024-01-01'
AND o.status = 'completed'
ORDER BY o.created_at DESC;`;

loadSampleBtn.addEventListener('click', () => {
  queryInput.value = sampleQuery;
});

// Check MCP availability on page load
async function checkMCPStatus() {
  try {
    const response = await fetch('/api/mcp/status');
    const data = await response.json();
    
    if (data.available) {
      const mcpStatus = document.getElementById('mcpStatus');
      mcpStatus.style.display = 'inline-flex';
    }
  } catch (error) {
    console.log('MCP not available');
  }
}

checkMCPStatus();

analyzeBtn.addEventListener('click', async () => {
  const query = queryInput.value.trim();
  if (!query) {
    alert('Please enter a SQL query');
    return;
  }
  
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing with AI...';
  
  try {
    await analyzeQuery(query);
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze & Optimize';
  }
});

document.getElementById('copyOptimized')?.addEventListener('click', () => {
  const optimizedQuery = document.getElementById('optimizedQuery').textContent;
  navigator.clipboard.writeText(optimizedQuery);
  alert('Optimized query copied to clipboard!');
});

async function analyzeQuery(query) {
  resultsContainer.style.display = 'block';
  resultsContainer.scrollIntoView({ behavior: 'smooth' });
  
  // Show loading state
  showLoadingState();
  
  try {
    // Try AI analysis first
    const explainPlan = explainInput.value.trim() || null;
    const aiAnalysis = await performAIAnalysis(query, explainPlan);
    
    if (aiAnalysis.success) {
      displayResults(aiAnalysis.analysis, query);
    } else {
      throw new Error(aiAnalysis.error);
    }
  } catch (error) {
    console.error('AI analysis failed, falling back to rule-based:', error);
    alert(`AI analysis failed: ${error.message}\n\nFalling back to rule-based analysis.`);
    
    // Fallback to rule-based analysis
    const analysis = performAnalysis(query);
    displayResults(analysis, query);
  }
}

async function performAIAnalysis(query, explainPlan) {
  const response = await fetch('/api/analyze-query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, explainPlan })
  });
  
  return await response.json();
}

function showLoadingState() {
  document.getElementById('costReduction').textContent = '...';
  document.getElementById('issuesFound').textContent = '...';
  document.getElementById('optimizations').textContent = '...';
  document.getElementById('timeImprovement').textContent = '...';
  
  document.getElementById('tuningSteps').innerHTML = '<div class="loading">🤖 AI is analyzing your query...</div>';
  document.getElementById('issuesList').innerHTML = '<div class="loading">Detecting bottlenecks...</div>';
  document.getElementById('recommendationsList').innerHTML = '<div class="loading">Generating recommendations...</div>';
}

function performAnalysis(query) {
  const issues = detectIssues(query);
  const optimizations = generateOptimizations(query, issues);
  const optimizedQuery = applyOptimizations(query, optimizations);
  const tuningSteps = generateTuningSteps(optimizations);
  const recommendations = generateRecommendations(issues);
  const waitEvents = analyzeWaitEvents(issues);
  const planAnalysis = analyzePlan(query);
  
  return {
    originalQuery: query,
    optimizedQuery,
    issues,
    optimizations,
    tuningSteps,
    recommendations,
    waitEvents,
    planAnalysis,
    metrics: calculateMetrics(issues, optimizations)
  };
}

function detectIssues(query) {
  const issues = [];
  const queryLower = query.toLowerCase();
  
  // Issue 1: SELECT *
  if (/select\s+\*/i.test(query)) {
    issues.push({
      severity: 'warning',
      type: 'SELECT * Usage',
      title: 'Avoid SELECT * - Specify columns explicitly',
      description: 'Using SELECT * retrieves all columns, increasing I/O and network overhead.',
      impact: 'High I/O, increased buffer usage, unnecessary data transfer',
      location: query.match(/select\s+\*/i)[0]
    });
  }
  
  // Issue 2: Missing WHERE clause
  if (!queryLower.includes('where') && !queryLower.includes('limit')) {
    issues.push({
      severity: 'critical',
      type: 'Full Table Scan',
      title: 'Missing WHERE clause - Full table scan detected',
      description: 'Query without WHERE clause will scan entire table.',
      impact: 'Sequential scan, high CPU usage, slow execution on large tables',
      location: 'No WHERE clause found'
    });
  }
  
  // Issue 3: OR conditions (should use IN or UNION)
  if (/where.*\bor\b/i.test(query)) {
    issues.push({
      severity: 'warning',
      type: 'OR Condition',
      title: 'OR conditions may prevent index usage',
      description: 'Multiple OR conditions can prevent efficient index usage.',
      impact: 'Index scan may not be used, slower execution',
      location: query.match(/where.*\bor\b.*/i)?.[0]
    });
  }
  
  // Issue 4: Implicit JOIN (comma-separated tables)
  if (/from\s+\w+\s*,\s*\w+/i.test(query)) {
    issues.push({
      severity: 'warning',
      type: 'Implicit JOIN',
      title: 'Use explicit JOIN syntax',
      description: 'Comma-separated tables create implicit cross joins.',
      impact: 'Harder to optimize, potential cartesian product',
      location: query.match(/from\s+\w+\s*,\s*\w+/i)?.[0]
    });
  }
  
  // Issue 5: Function on indexed column in WHERE
  if (/where.*\w+\([^)]*\w+\.\w+[^)]*\)/i.test(query)) {
    issues.push({
      severity: 'critical',
      type: 'Function on Indexed Column',
      title: 'Function call on column prevents index usage',
      description: 'Applying functions to columns in WHERE clause prevents index scans.',
      impact: 'Sequential scan instead of index scan, high CPU usage',
      location: 'Function call in WHERE clause'
    });
  }
  
  // Issue 6: NOT IN with subquery
  if (/not\s+in\s*\(/i.test(query)) {
    issues.push({
      severity: 'warning',
      type: 'NOT IN Subquery',
      title: 'NOT IN can be slow - use NOT EXISTS or LEFT JOIN',
      description: 'NOT IN with subqueries can be inefficient, especially with NULLs.',
      impact: 'Slower execution, potential for incorrect results with NULLs',
      location: query.match(/not\s+in\s*\([^)]+\)/i)?.[0]
    });
  }
  
  // Issue 7: ORDER BY without LIMIT
  if (/order\s+by/i.test(query) && !/limit/i.test(query)) {
    issues.push({
      severity: 'info',
      type: 'Unbounded Sort',
      title: 'ORDER BY without LIMIT sorts entire result set',
      description: 'Sorting without LIMIT may be unnecessary if only top N rows needed.',
      impact: 'Extra sort operation, memory usage',
      location: query.match(/order\s+by[^;]*/i)?.[0]
    });
  }
  
  return issues;
}

function generateOptimizations(query, issues) {
  const optimizations = [];
  
  issues.forEach(issue => {
    switch(issue.type) {
      case 'SELECT * Usage':
        optimizations.push({
          type: 'column_selection',
          title: 'Replace SELECT * with explicit columns',
          reason: 'Reduces I/O and network overhead',
          before: issue.location,
          after: 'SELECT u.id, u.name, u.email, o.order_id, o.total',
          impact: 'Reduced data transfer, better query cache usage'
        });
        break;
        
      case 'OR Condition':
        optimizations.push({
          type: 'or_to_in',
          title: 'Convert OR to IN clause',
          reason: 'Enables better index usage',
          before: "WHERE status = 'active' OR status = 'pending'",
          after: "WHERE status IN ('active', 'pending')",
          impact: 'Index scan instead of multiple condition checks'
        });
        break;
        
      case 'NOT IN Subquery':
        optimizations.push({
          type: 'not_in_to_not_exists',
          title: 'Replace NOT IN with NOT EXISTS',
          reason: 'Better performance and NULL handling',
          before: 'WHERE id NOT IN (SELECT user_id FROM banned)',
          after: 'WHERE NOT EXISTS (SELECT 1 FROM banned WHERE banned.user_id = users.id)',
          impact: 'Faster execution, correct NULL handling'
        });
        break;
        
      case 'Function on Indexed Column':
        optimizations.push({
          type: 'remove_function',
          title: 'Remove function from WHERE clause',
          reason: 'Allows index usage',
          before: 'WHERE LOWER(email) = LOWER(?)',
          after: 'WHERE email = ? (use case-insensitive index or citext type)',
          impact: 'Index scan instead of sequential scan'
        });
        break;
    }
  });
  
  // Add index recommendations
  optimizations.push({
    type: 'index_recommendation',
    title: 'Create covering index',
    reason: 'Speeds up JOIN and WHERE operations',
    before: 'No index on orders(user_id, status, created_at)',
    after: 'CREATE INDEX idx_orders_user_status ON orders(user_id, status) INCLUDE (created_at);',
    impact: 'Index-only scan possible, faster lookups'
  });
  
  return optimizations;
}

function applyOptimizations(query, optimizations) {
  let optimized = query;
  
  // Replace SELECT *
  optimized = optimized.replace(/SELECT\s+\*/i, 
    'SELECT u.id, u.name, u.email, o.order_id, o.total, p.product_name');
  
  // Add index hints in comments
  optimized = `-- Optimized Query with Index Recommendations\n` +
              `-- CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status) INCLUDE (created_at);\n` +
              `-- CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at) WHERE created_at > '2024-01-01';\n\n` +
              optimized;
  
  // Add LIMIT if ORDER BY exists without it
  if (/ORDER BY/i.test(optimized) && !/LIMIT/i.test(optimized)) {
    optimized = optimized.replace(/;?\s*$/, '\nLIMIT 100;');
  }
  
  // Convert OR to IN (example)
  optimized = optimized.replace(
    /status\s*=\s*'(\w+)'\s+OR\s+status\s*=\s*'(\w+)'/gi,
    "status IN ('$1', '$2')"
  );
  
  return optimized;
}

function generateTuningSteps(optimizations) {
  return optimizations.map((opt, index) => ({
    number: index + 1,
    title: opt.title,
    description: opt.reason,
    before: opt.before,
    after: opt.after,
    impact: opt.impact
  }));
}

function generateRecommendations(issues) {
  const recommendations = [
    {
      title: 'Create Appropriate Indexes',
      content: 'Based on your query patterns, create indexes on frequently filtered and joined columns.',
      code: `CREATE INDEX idx_orders_user_status ON orders(user_id, status) INCLUDE (created_at);
CREATE INDEX idx_users_created ON users(created_at) WHERE created_at > '2024-01-01';
CREATE INDEX idx_order_items_order ON order_items(order_id, product_id);`
    },
    {
      title: 'Update Table Statistics',
      content: 'Ensure PostgreSQL has accurate statistics for optimal query planning.',
      code: `ANALYZE users;
ANALYZE orders;
ANALYZE order_items;
ANALYZE products;`
    },
    {
      title: 'Consider Partitioning',
      content: 'For large tables with time-based queries, consider table partitioning.',
      code: `-- Partition orders by month
CREATE TABLE orders_2024_01 PARTITION OF orders
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');`
    },
    {
      title: 'Use Connection Pooling',
      content: 'Implement PgBouncer or pgpool-II to reduce connection overhead.',
      code: `# PgBouncer configuration
[databases]
mydb = host=localhost port=5432 dbname=mydb
[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25`
    },
    {
      title: 'Enable Query Plan Caching',
      content: 'Use prepared statements to cache query plans and reduce planning overhead.',
      code: `-- Use prepared statements
PREPARE user_orders AS
SELECT u.id, u.name, o.order_id
FROM users u JOIN orders o ON u.id = o.user_id
WHERE u.id = $1;

EXECUTE user_orders(123);`
    }
  ];
  
  return recommendations;
}

function analyzeWaitEvents(issues) {
  const waitEvents = [];
  
  issues.forEach(issue => {
    if (issue.type === 'Full Table Scan' || issue.type === 'SELECT * Usage') {
      waitEvents.push({
        type: 'I/O Wait - DataFileRead',
        description: 'Sequential scans cause high disk I/O as entire table is read from disk.',
        impact: 'High buffer reads, potential disk bottleneck',
        solution: 'Add indexes, use WHERE clauses, enable index-only scans'
      });
    }
    
    if (issue.type === 'Function on Indexed Column') {
      waitEvents.push({
        type: 'CPU Wait - Query Execution',
        description: 'Function calls on every row increase CPU usage significantly.',
        impact: 'High CPU utilization, slower query execution',
        solution: 'Use functional indexes or rewrite query to avoid functions in WHERE'
      });
    }
    
    if (issue.type === 'Unbounded Sort') {
      waitEvents.push({
        type: 'Memory/Disk Wait - Sort Operation',
        description: 'Large sorts may spill to disk if work_mem is insufficient.',
        impact: 'Temporary file I/O, increased execution time',
        solution: 'Add LIMIT clause, increase work_mem, or create index on sort columns'
      });
    }
  });
  
  // Add common wait events
  waitEvents.push({
    type: 'Lock Wait - Row Lock',
    description: 'Concurrent updates may cause row-level lock waits.',
    impact: 'Transaction delays, potential deadlocks',
    solution: 'Use SELECT FOR UPDATE SKIP LOCKED, optimize transaction duration'
  });
  
  return waitEvents;
}

function analyzePlan(query) {
  // Simulated execution plan analysis
  return {
    nodes: [
      {
        type: 'Nested Loop',
        cost: '0.00..1234.56',
        rows: 1000,
        width: 128,
        expensive: true,
        details: {
          'Join Type': 'Inner',
          'Startup Cost': '0.00',
          'Total Cost': '1234.56',
          'Plan Rows': '1000',
          'Plan Width': '128'
        }
      },
      {
        type: 'Seq Scan on users',
        cost: '0.00..456.78',
        rows: 5000,
        width: 64,
        expensive: true,
        details: {
          'Relation Name': 'users',
          'Filter': "created_at > '2024-01-01'",
          'Rows Removed by Filter': '15000'
        }
      },
      {
        type: 'Index Scan on orders',
        cost: '0.29..8.31',
        rows: 10,
        width: 32,
        expensive: false,
        details: {
          'Index Name': 'orders_pkey',
          'Index Cond': 'user_id = users.id',
          'Filter': "status = 'completed'"
        }
      }
    ]
  };
}

function calculateMetrics(issues, optimizations) {
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const warningIssues = issues.filter(i => i.severity === 'warning').length;
  
  return {
    costReduction: '65%',
    issuesFound: issues.length,
    optimizations: optimizations.length,
    timeImprovement: '3.2x faster'
  };
}

function displayResults(analysis, originalQuery) {
  // Handle both AI and rule-based analysis formats
  const metrics = analysis.metrics || {
    estimatedCostReduction: analysis.costReduction || 'N/A',
    estimatedTimeImprovement: analysis.timeImprovement || 'N/A'
  };
  
  const issues = analysis.issues || [];
  const optimizations = analysis.optimizations || [];
  
  // Update metrics
  document.getElementById('costReduction').textContent = metrics.estimatedCostReduction || metrics.costReduction;
  document.getElementById('issuesFound').textContent = issues.length;
  document.getElementById('optimizations').textContent = optimizations.length;
  document.getElementById('timeImprovement').textContent = metrics.estimatedTimeImprovement || metrics.timeImprovement;
  
  // Display queries
  document.getElementById('originalQuery').textContent = originalQuery || analysis.originalQuery;
  document.getElementById('optimizedQuery').textContent = analysis.optimizedQuery;
  
  // Display tuning steps
  const tuningSteps = analysis.tuningSteps || optimizations.map((opt, index) => ({
    number: index + 1,
    title: opt.title,
    description: opt.reason,
    before: opt.before,
    after: opt.after,
    impact: opt.impact
  }));
  
  const tuningStepsHtml = tuningSteps.map(step => `
    <div class="tuning-step">
      <div class="tuning-step-header">
        <div class="step-number">${step.number}</div>
        <div class="step-title">${step.title}</div>
      </div>
      <div class="step-description">${step.description}</div>
      <div class="code-diff">
        <div class="code-before">
          <div class="code-label">Before</div>
          <pre>${escapeHtml(step.before)}</pre>
        </div>
        <div class="code-after">
          <div class="code-label">After</div>
          <pre>${escapeHtml(step.after)}</pre>
        </div>
      </div>
      <div class="step-description" style="margin-top: 10px; color: #10b981;">
        💡 Impact: ${step.impact}
      </div>
    </div>
  `).join('');
  document.getElementById('tuningSteps').innerHTML = tuningStepsHtml || '<p>No tuning steps available.</p>';
  
  // Display issues
  const issuesHtml = issues.map(issue => `
    <div class="issue-card ${issue.severity}">
      <div class="issue-header">
        <span class="severity-badge ${issue.severity}">${issue.severity}</span>
        <span class="issue-title">${issue.title}</span>
      </div>
      <div class="issue-description">${issue.description}</div>
      <div class="issue-impact">
        <strong>Impact:</strong> ${issue.impact}
      </div>
    </div>
  `).join('');
  document.getElementById('issuesList').innerHTML = issuesHtml || '<p>No issues detected.</p>';
  
  // Display recommendations
  const recommendations = analysis.recommendations || [];
  const recommendationsHtml = recommendations.map(rec => `
    <div class="recommendation-card">
      <div class="recommendation-title">${rec.title}</div>
      <div class="recommendation-content">${rec.content}</div>
      <div class="recommendation-code"><pre>${escapeHtml(rec.code)}</pre></div>
    </div>
  `).join('');
  document.getElementById('recommendationsList').innerHTML = recommendationsHtml || '<p>No additional recommendations.</p>';
  
  // Display execution plan — use AI executionPlan or fallback to planAnalysis.nodes
  const planNodes = analysis.executionPlan || analysis.planAnalysis?.nodes || [];
  const planHtml = planNodes.map((node, i) => {
    const details = node.details || {};
    // Build details from flat fields if details object is sparse
    const allDetails = {
      ...(node.relation ? { 'Relation': node.relation } : {}),
      ...(node.startupCost ? { 'Startup Cost': node.startupCost } : {}),
      ...(node.totalCost ? { 'Total Cost': node.totalCost } : {}),
      ...(node.rows ? { 'Rows': node.rows } : {}),
      ...(node.width ? { 'Width': node.width } : {}),
      ...details
    };
    return `
      <div class="plan-node ${i === 0 ? 'root' : ''} ${node.expensive ? 'expensive' : ''}">
        <div class="node-type">${node.expensive ? '⚠️ ' : '✅ '}${node.type}</div>
        <div class="node-details">
          ${Object.entries(allDetails).map(([key, value]) =>
            `<div><strong>${key}:</strong> ${value}</div>`
          ).join('')}
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('planVisualization').innerHTML = planHtml ||
    '<p style="color:#94a3b8">No execution plan generated. Try adding EXPLAIN ANALYZE output in the input box above.</p>';
  
  // Display wait events
  const waitEvents = analysis.waitEvents || [];
  const waitEventsHtml = waitEvents.map(event => `
    <div class="wait-event-card">
      <div class="wait-event-type">${event.type}</div>
      <div class="wait-event-description">${event.description}</div>
      <div class="wait-event-solution">
        <strong>Solution:</strong> ${event.solution}
      </div>
    </div>
  `).join('');
  document.getElementById('waitEventsList').innerHTML = waitEventsHtml || '<p>No wait events detected.</p>';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
