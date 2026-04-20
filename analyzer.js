const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const analysisSection = document.getElementById('analysisSection');
const logContent = document.getElementById('logContent');
const analysisResults = document.getElementById('analysisResults');
const loadSampleBtn = document.getElementById('loadSample');

// Sample PostgreSQL log for demo
const sampleLog = `2024-03-04 10:23:45 UTC [1234]: ERROR:  relation "users" does not exist at character 15
2024-03-04 10:23:45 UTC [1234]: STATEMENT:  SELECT * FROM users WHERE id = 1
2024-03-04 10:24:12 UTC [5678]: ERROR:  deadlock detected
2024-03-04 10:24:12 UTC [5678]: DETAIL:  Process 5678 waits for ShareLock on transaction 12345; blocked by process 9012.
2024-03-04 10:24:12 UTC [5678]: HINT:  See server log for query details.
2024-03-04 10:25:33 UTC [9012]: WARNING:  out of shared memory
2024-03-04 10:25:33 UTC [9012]: HINT:  You might need to increase max_connections or shared_buffers.
2024-03-04 10:26:01 UTC [1111]: ERROR:  syntax error at or near "SELCT" at character 1
2024-03-04 10:26:01 UTC [1111]: STATEMENT:  SELCT * FROM orders
2024-03-04 10:27:15 UTC [2222]: FATAL:  too many connections for role "app_user"
2024-03-04 10:28:30 UTC [3333]: ERROR:  column "email" does not exist
2024-03-04 10:28:30 UTC [3333]: HINT:  Perhaps you meant to reference the column "user_email".`;

uploadBox.addEventListener('click', () => fileInput.click());

uploadBox.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
  uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadBox.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) processFile(file);
});

loadSampleBtn.addEventListener('click', () => {
  processLogContent(sampleLog);
});

function processFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    processLogContent(e.target.result);
  };
  reader.readAsText(file);
}

function processLogContent(content) {
  logContent.textContent = content;
  analysisSection.style.display = 'grid';
  analysisResults.innerHTML = '<div class="loading">Analyzing log file...</div>';
  
  setTimeout(() => {
    const analysis = analyzeLog(content);
    displayAnalysis(analysis);
  }, 1000);
}

function analyzeLog(logText) {
  const lines = logText.split('\n');
  const issues = [];
  
  const patterns = [
    {
      regex: /ERROR:\s+relation "([^"]+)" does not exist/,
      severity: 'critical',
      type: 'Missing Table/Relation',
      getSolution: (match) => ({
        description: `Table or view "${match[1]}" does not exist in the database.`,
        recommendations: [
          `Verify the table name spelling: "${match[1]}"`,
          'Check if the table exists in the correct schema',
          'Run: SELECT * FROM information_schema.tables WHERE table_name = \'' + match[1] + '\'',
          'Ensure migrations have been applied'
        ]
      })
    },
    {
      regex: /ERROR:\s+deadlock detected/,
      severity: 'critical',
      type: 'Deadlock',
      getSolution: () => ({
        description: 'Multiple transactions are waiting for each other, causing a deadlock.',
        recommendations: [
          'Review transaction isolation levels',
          'Ensure consistent lock ordering in application code',
          'Consider using SELECT FOR UPDATE NOWAIT',
          'Reduce transaction duration',
          'Enable deadlock logging: log_lock_waits = on'
        ]
      })
    },
    {
      regex: /WARNING:\s+out of shared memory/,
      severity: 'warning',
      type: 'Memory Issue',
      getSolution: () => ({
        description: 'PostgreSQL is running out of shared memory.',
        recommendations: [
          'Increase shared_buffers in postgresql.conf',
          'Increase max_connections if needed',
          'Monitor memory usage with pg_stat_activity',
          'Consider connection pooling (PgBouncer)',
          'Review work_mem settings'
        ]
      })
    },
    {
      regex: /ERROR:\s+syntax error at or near "([^"]+)"/,
      severity: 'critical',
      type: 'Syntax Error',
      getSolution: (match) => ({
        description: `SQL syntax error near "${match[1]}".`,
        recommendations: [
          'Check SQL statement for typos',
          'Verify PostgreSQL version compatibility',
          'Review query in the STATEMENT line',
          'Use a SQL linter or formatter'
        ]
      })
    },
    {
      regex: /FATAL:\s+too many connections/,
      severity: 'critical',
      type: 'Connection Limit',
      getSolution: () => ({
        description: 'Maximum number of connections reached.',
        recommendations: [
          'Implement connection pooling (PgBouncer, pgpool)',
          'Increase max_connections in postgresql.conf',
          'Review application connection management',
          'Close idle connections',
          'Monitor with: SELECT count(*) FROM pg_stat_activity'
        ]
      })
    },
    {
      regex: /ERROR:\s+column "([^"]+)" does not exist/,
      severity: 'critical',
      type: 'Missing Column',
      getSolution: (match) => ({
        description: `Column "${match[1]}" does not exist in the table.`,
        recommendations: [
          'Verify column name spelling',
          'Check table schema with: \\d table_name',
          'Ensure migrations are up to date',
          'Review the HINT line for suggestions'
        ]
      })
    }
  ];

  lines.forEach((line, index) => {
    patterns.forEach(pattern => {
      const match = line.match(pattern.regex);
      if (match) {
        const solution = pattern.getSolution(match);
        issues.push({
          severity: pattern.severity,
          type: pattern.type,
          line: index + 1,
          logLine: line,
          ...solution
        });
      }
    });
  });

  return {
    totalIssues: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    issues
  };
}

function displayAnalysis(analysis) {
  let html = `
    <div class="summary-stats">
      <div class="stat-card">
        <div class="stat-number">${analysis.totalIssues}</div>
        <div class="stat-label">Total Issues</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${analysis.critical}</div>
        <div class="stat-label">Critical</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${analysis.warnings}</div>
        <div class="stat-label">Warnings</div>
      </div>
    </div>
  `;

  if (analysis.issues.length === 0) {
    html += '<div class="issue-card success"><p>No issues detected in the log file.</p></div>';
  } else {
    analysis.issues.forEach(issue => {
      html += `
        <div class="issue-card ${issue.severity}">
          <div class="issue-header">
            <span class="severity-badge ${issue.severity}">${issue.severity}</span>
            <span class="issue-title">${issue.type}</span>
          </div>
          <div class="issue-description">${issue.description}</div>
          <div class="issue-location">Line ${issue.line}: ${issue.logLine}</div>
          <div class="recommendations">
            <h4>Recommendations:</h4>
            <ul>
              ${issue.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    });
  }

  analysisResults.innerHTML = html;
}
