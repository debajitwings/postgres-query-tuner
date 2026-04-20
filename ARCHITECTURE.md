# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Student    │  │  PostgreSQL  │  │   Query Tuner        │ │
│  │   Admission  │  │  Log         │  │   (AI-Powered)       │ │
│  │   Portal     │  │  Analyzer    │  │                      │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express.js Backend                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Admission   │  │  Log Parser  │  │   AI Service         │ │
│  │  API         │  │  Engine      │  │   Integration        │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                              │                  │
└──────────────────────────────────────────────┼──────────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────┐
                    │                          │                  │
                    ▼                          ▼                  ▼
         ┌──────────────────┐      ┌──────────────────┐  ┌──────────────┐
         │  Anthropic API   │      │   OpenAI API     │  │  PostgreSQL  │
         │  (Claude 3.5)    │      │   (GPT-4)        │  │  MCP Server  │
         └──────────────────┘      └──────────────────┘  └──────────────┘
                                                                  │
                                                                  ▼
                                                          ┌──────────────┐
                                                          │  PostgreSQL  │
                                                          │  Database    │
                                                          └──────────────┘
```

## Component Details

### Frontend Applications

#### 1. Student Admission Portal
- **Purpose**: Manage student applications
- **Features**: CRUD operations, status management
- **Tech**: Vanilla JavaScript, HTML5, CSS3

#### 2. PostgreSQL Log Analyzer
- **Purpose**: Parse and analyze PostgreSQL error logs
- **Features**: Pattern matching, issue detection, recommendations
- **Tech**: Client-side JavaScript, regex parsing

#### 3. Query Tuner (AI-Powered)
- **Purpose**: Optimize SQL queries with AI assistance
- **Features**: 
  - AI-powered analysis (Claude/GPT-4)
  - Rule-based fallback
  - EXPLAIN plan visualization
  - Query rewriting
  - Index recommendations
- **Tech**: JavaScript, AI API integration

### Backend Services

#### Express.js Server
- **Port**: 3000
- **Endpoints**:
  - `/api/admissions` - Student admission CRUD
  - `/api/analyze-query` - AI query analysis
  - `/api/mcp/*` - MCP proxy endpoints

#### AI Service (ai-service.js)
- **Providers**: Anthropic Claude, OpenAI GPT-4
- **Features**:
  - Intelligent prompt engineering
  - JSON response parsing
  - Error handling and fallback
  - Multi-provider support

#### MCP Integration (mcp-integration.js)
- **Purpose**: Connect to real PostgreSQL databases
- **Features**:
  - EXPLAIN ANALYZE execution
  - Table statistics retrieval
  - Schema inspection
  - Index analysis

### External Services

#### Anthropic Claude API
- **Model**: claude-3-5-sonnet-20241022
- **Use**: Primary AI analysis engine
- **Strengths**: 
  - Superior reasoning for complex queries
  - Better instruction following
  - Excellent technical analysis

#### OpenAI GPT-4 API
- **Model**: gpt-4-turbo-preview
- **Use**: Alternative AI provider
- **Strengths**:
  - Fast response times
  - Good structured output
  - Wide knowledge base

#### PostgreSQL MCP Server
- **Protocol**: Model Context Protocol
- **Purpose**: Direct database access through Kiro
- **Features**:
  - Real EXPLAIN plans
  - Live table statistics
  - Schema introspection
  - Safe read-only operations

## Data Flow

### Query Analysis Flow

```
User Input (SQL Query)
        │
        ▼
┌───────────────────┐
│  Frontend         │
│  - Validate input │
│  - Show loading   │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Backend API      │
│  /api/analyze     │
└───────────────────┘
        │
        ├─────────────────┐
        ▼                 ▼
┌──────────────┐   ┌──────────────┐
│  AI Service  │   │  MCP Server  │
│  (Claude)    │   │  (Optional)  │
└──────────────┘   └──────────────┘
        │                 │
        │                 ▼
        │          ┌──────────────┐
        │          │  PostgreSQL  │
        │          │  EXPLAIN     │
        │          └──────────────┘
        │                 │
        └────────┬────────┘
                 ▼
        ┌──────────────────┐
        │  Analysis Result │
        │  - Issues        │
        │  - Optimizations │
        │  - Rewritten SQL │
        │  - Metrics       │
        └──────────────────┘
                 │
                 ▼
        ┌──────────────────┐
        │  Frontend        │
        │  - Display       │
        │  - Visualize     │
        └──────────────────┘
```

### MCP Integration Flow (Kiro IDE)

```
Kiro IDE
    │
    ▼
┌─────────────────────┐
│  MCP Configuration  │
│  .kiro/settings/    │
│  mcp.json           │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  uvx Process        │
│  mcp-server-        │
│  postgres           │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  PostgreSQL         │
│  Database           │
│  - EXPLAIN          │
│  - Statistics       │
│  - Schema           │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  Kiro Agent         │
│  - Query Analysis   │
│  - Recommendations  │
└─────────────────────┘
```

## Security Considerations

### API Keys
- Stored in `.env` file (not committed to git)
- Server-side only (never exposed to frontend)
- Separate keys for different providers

### Database Access
- Read-only user recommended for MCP
- Connection string in secure config
- SSL/TLS for remote connections
- No credentials in frontend code

### Input Validation
- SQL injection prevention (read-only operations)
- Query size limits
- Rate limiting on API endpoints
- CORS configuration

## Scalability

### Current Architecture
- Single Node.js process
- In-memory storage for admissions
- Stateless API design
- Client-side rendering

### Future Enhancements
- Database persistence (PostgreSQL)
- Redis caching for AI responses
- Load balancing for multiple instances
- WebSocket for real-time updates
- Query result caching
- Batch query analysis

## Performance Optimization

### Frontend
- Lazy loading of results
- Debounced API calls
- Client-side caching
- Minimal dependencies

### Backend
- Async/await for non-blocking I/O
- Connection pooling for database
- Response compression
- API response caching

### AI Integration
- Prompt optimization for token efficiency
- Fallback to rule-based analysis
- Response streaming (future)
- Batch processing (future)

## Deployment Options

### Local Development
```bash
npm start
# Runs on http://localhost:3000
```

### Production Deployment
- **Docker**: Containerize with Dockerfile
- **Cloud**: Deploy to AWS, GCP, Azure
- **Serverless**: AWS Lambda + API Gateway
- **Platform**: Heroku, Render, Railway

### Environment Variables
```env
NODE_ENV=production
PORT=3000
ANTHROPIC_API_KEY=sk-ant-xxx
AI_PROVIDER=anthropic
POSTGRES_CONNECTION_STRING=postgresql://...
```

## Monitoring & Logging

### Current Implementation
- Console logging for errors
- Request/response logging
- AI API call tracking

### Recommended Additions
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Query performance metrics
- AI usage analytics
- Cost tracking for API calls

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | HTML5, CSS3, JavaScript | User interface |
| Backend | Node.js, Express | API server |
| AI | Claude 3.5, GPT-4 | Query analysis |
| Database | PostgreSQL | Data storage |
| Protocol | MCP | Database integration |
| Package Manager | npm | Dependencies |
| Python Runtime | uv/uvx | MCP server |

## Development Workflow

1. **Local Development**: `npm start`
2. **Testing**: Manual testing in browser
3. **AI Testing**: Use sample queries
4. **MCP Testing**: Connect to test database
5. **Deployment**: Push to production server

## Future Roadmap

- [ ] Real-time query monitoring
- [ ] Query history and comparison
- [ ] Team collaboration features
- [ ] Custom optimization rules
- [ ] Integration with CI/CD pipelines
- [ ] Query performance benchmarking
- [ ] Automated index creation
- [ ] Cost estimation for cloud databases
