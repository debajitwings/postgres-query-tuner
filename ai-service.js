const axios = require('axios');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config();

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'bedrock';

    // Anthropic direct API
    this.anthropicKey = process.env.ANTHROPIC_API_KEY;
    this.anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

    // OpenAI
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.openaiModel = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

    // AWS Bedrock
    this.bedrockModel = process.env.BEDROCK_MODEL || 'anthropic.claude-3-5-sonnet-20241022-v2:0';
    this.bedrockRegion = process.env.AWS_REGION || 'us-east-1';

    // Initialize Bedrock client (uses AWS credentials from env or ~/.aws/credentials)
    this.bedrockClient = new BedrockRuntimeClient({
      region: this.bedrockRegion,
      ...(process.env.AWS_ACCESS_KEY_ID && {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          ...(process.env.AWS_SESSION_TOKEN && {
            sessionToken: process.env.AWS_SESSION_TOKEN
          })
        }
      })
    });
  }

  async analyzeQuery(query, explainPlan = null) {
    const prompt = this.buildPrompt(query, explainPlan);

    try {
      if (this.provider === 'bedrock') {
        return await this.callBedrock(prompt);
      } else if (this.provider === 'anthropic' && this.anthropicKey) {
        return await this.callClaude(prompt);
      } else if (this.provider === 'openai' && this.openaiKey) {
        return await this.callOpenAI(prompt);
      } else {
        throw new Error('No AI provider configured. Set AI_PROVIDER in .env file.');
      }
    } catch (error) {
      console.error('AI Analysis Error:', error.message);
      throw error;
    }
  }

  async callBedrock(prompt) {
    console.log(`Calling AWS Bedrock: ${this.bedrockModel} in ${this.bedrockRegion}`);

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: this.bedrockModel,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await this.bedrockClient.send(command);

    // Decode the response body
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const content = responseBody.content[0].text;

    return this.parseAIResponse(content);
  }

  async callClaude(prompt) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.anthropicModel,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.anthropicKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    const content = response.data.content[0].text;
    return this.parseAIResponse(content);
  }

  async callOpenAI(prompt) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.openaiModel,
        messages: [
          {
            role: 'system',
            content: 'You are a PostgreSQL performance expert. Provide responses in valid JSON format.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4096
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiKey}`
        }
      }
    );

    const content = response.data.choices[0].message.content;
    return this.parseAIResponse(content);
  }

  buildPrompt(query, explainPlan) {
    return `You are a PostgreSQL performance expert. Analyze the following SQL query and provide optimization recommendations.

SQL Query:
\`\`\`sql
${query}
\`\`\`

${explainPlan ? `EXPLAIN Plan:\n\`\`\`json\n${explainPlan}\n\`\`\`\n` : ''}

Please provide a comprehensive analysis in the following JSON format:

{
  "issues": [
    {
      "severity": "critical|warning|info",
      "type": "Issue Type",
      "title": "Brief title",
      "description": "Detailed description",
      "impact": "Performance impact",
      "location": "Specific part of query"
    }
  ],
  "optimizations": [
    {
      "type": "optimization_type",
      "title": "Optimization title",
      "reason": "Why this optimization helps",
      "before": "Original code snippet",
      "after": "Optimized code snippet",
      "impact": "Expected performance improvement"
    }
  ],
  "optimizedQuery": "Complete rewritten optimized query",
  "recommendations": [
    {
      "title": "Recommendation title",
      "content": "Detailed explanation",
      "code": "SQL code example"
    }
  ],
  "waitEvents": [
    {
      "type": "Wait event type",
      "description": "What causes this wait",
      "impact": "Performance impact",
      "solution": "How to resolve"
    }
  ],
  "executionPlan": [
    {
      "type": "Node type (e.g. Seq Scan, Index Scan, Hash Join, Nested Loop, Sort, Aggregate)",
      "relation": "table name if applicable",
      "expensive": true,
      "startupCost": "0.00",
      "totalCost": "1234.56",
      "rows": 1000,
      "width": 64,
      "details": {
        "key": "value pairs describing this node"
      }
    }
  ],
  "metrics": {
    "estimatedCostReduction": "percentage or multiplier",
    "estimatedTimeImprovement": "percentage or multiplier",
    "confidence": "high|medium|low"
  }
}

Always populate the executionPlan array with estimated nodes based on the query structure even without a real EXPLAIN output — infer likely plan nodes from the query (JOINs, WHERE clauses, ORDER BY, subqueries, etc.) and mark expensive ones.

Focus on:
1. Sequential scans vs index scans
2. Missing or inefficient indexes
3. JOIN order and type optimization
4. Subquery vs CTE vs JOIN alternatives
5. Function calls on indexed columns
6. SELECT * usage
7. Missing WHERE clauses
8. OR conditions that prevent index usage
9. Sort and aggregation optimizations
10. Partition pruning opportunities

Provide specific, actionable recommendations with exact SQL code.`;
  }

  parseAIResponse(content) {
    try {
      // Step 1: Extract JSON block from markdown if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                       content.match(/```\n([\s\S]*?)\n```/);
      let jsonStr = jsonMatch ? jsonMatch[1] : content;

      // Step 2: Trim to outermost { ... }
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
      }

      // Step 3: Replace backtick template literals with regular strings
      // Handles multiline SQL inside backticks
      jsonStr = jsonStr.replace(/`([\s\S]*?)`/g, (_, inner) => {
        const escaped = inner
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '')
          .replace(/\t/g, '\\t');
        return `"${escaped}"`;
      });

      // Step 4: Strip unescaped control characters inside JSON strings
      jsonStr = jsonStr.replace(/"((?:[^"\\]|\\.)*)"/gs, (match) =>
        match.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      );

      return JSON.parse(jsonStr);

    } catch (error) {
      console.error('Failed to parse AI response:', error.message);
      return {
        issues: [],
        optimizations: [],
        optimizedQuery: '',
        recommendations: [],
        waitEvents: [],
        executionPlan: [],
        metrics: {
          estimatedCostReduction: 'N/A',
          estimatedTimeImprovement: 'N/A',
          confidence: 'low'
        },
        error: 'Failed to parse AI response: ' + error.message
      };
    }
  }
}

module.exports = new AIService();
