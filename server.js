require('dotenv').config();
const express = require('express');
const cors = require('cors');
const aiService = require('./ai-service');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

let students = [];
let nextId = 1;

app.post('/api/admissions', (req, res) => {
  const { name, email, course, phone } = req.body;
  
  if (!name || !email || !course) {
    return res.status(400).json({ error: 'Name, email, and course are required' });
  }
  
  const student = {
    id: nextId++,
    name,
    email,
    course,
    phone,
    status: 'pending',
    submittedAt: new Date().toISOString()
  };
  
  students.push(student);
  res.status(201).json(student);
});

app.get('/api/admissions', (req, res) => {
  res.json(students);
});

app.patch('/api/admissions/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const student = students.find(s => s.id === parseInt(id));
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  student.status = status;
  res.json(student);
});

// AI-powered query analysis endpoint
app.post('/api/analyze-query', async (req, res) => {
  try {
    const { query, explainPlan } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log('Analyzing query with AI...');
    const analysis = await aiService.analyzeQuery(query, explainPlan);
    
    res.json({
      success: true,
      analysis,
      provider: process.env.AI_PROVIDER || 'anthropic',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Query analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Make sure you have set up your API keys in the .env file'
    });
  }
});

// MCP Status endpoint
app.get('/api/mcp/status', (req, res) => {
  res.json({
    available: false,
    message: 'MCP integration is configured through Kiro IDE. Use Kiro to connect to PostgreSQL MCP server.',
    setupGuide: 'See MCP_SETUP.md for configuration instructions'
  });
});

// MCP proxy endpoints (these would be used when running inside Kiro)
app.post('/api/mcp/explain-query', async (req, res) => {
  res.status(501).json({
    error: 'MCP integration requires Kiro IDE',
    message: 'Please use Kiro IDE with PostgreSQL MCP server configured',
    setupGuide: 'See MCP_SETUP.md'
  });
});

app.post('/api/mcp/list-tables', async (req, res) => {
  res.status(501).json({
    error: 'MCP integration requires Kiro IDE',
    message: 'Please use Kiro IDE with PostgreSQL MCP server configured'
  });
});

app.post('/api/mcp/describe-table', async (req, res) => {
  res.status(501).json({
    error: 'MCP integration requires Kiro IDE',
    message: 'Please use Kiro IDE with PostgreSQL MCP server configured'
  });
});

app.post('/api/mcp/table-stats', async (req, res) => {
  res.status(501).json({
    error: 'MCP integration requires Kiro IDE',
    message: 'Please use Kiro IDE with PostgreSQL MCP server configured'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`- Student Admission: http://localhost:${PORT}/admission.html`);
  console.log(`- Log Analyzer: http://localhost:${PORT}/log-analyzer.html`);
  console.log(`- Query Tuner: http://localhost:${PORT}/query-tuner.html`);
});
