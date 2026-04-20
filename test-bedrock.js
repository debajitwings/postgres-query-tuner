require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

async function testBedrock() {
  console.log('Testing AWS Bedrock connection...');
  console.log('Region:', process.env.AWS_REGION);
  console.log('Model:', process.env.BEDROCK_MODEL);
  console.log('Access Key:', process.env.AWS_ACCESS_KEY_ID?.slice(0, 8) + '...');

  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      ...(process.env.AWS_SESSION_TOKEN && { sessionToken: process.env.AWS_SESSION_TOKEN })
    }
  });

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 100,
    messages: [{ role: 'user', content: 'Say: Bedrock connection successful!' }]
  };

  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload)
  });

  try {
    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    console.log('\n✅ Bedrock connection successful!');
    console.log('Response:', result.content[0].text);
  } catch (error) {
    console.error('\n❌ Bedrock connection failed!');
    console.error('Error:', error.message);

    if (error.name === 'AccessDeniedException') {
      console.error('\nFix: Enable Claude model access in AWS Console');
      console.error('→ Go to: AWS Console → Bedrock → Model Access → Enable Claude');
    } else if (error.name === 'UnrecognizedClientException') {
      console.error('\nFix: Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env');
    } else if (error.name === 'ValidationException') {
      console.error('\nFix: Check BEDROCK_MODEL value in .env');
      console.error('Valid models:');
      console.error('  anthropic.claude-3-5-sonnet-20241022-v2:0');
      console.error('  anthropic.claude-3-5-haiku-20241022-v1:0');
    }
  }
}

testBedrock();
