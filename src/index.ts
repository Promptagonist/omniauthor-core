import express from 'express';
import cors from 'cors';
import { VertexAI } from '@google-cloud/vertexai';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Initialize Vertex AI
const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'gen-lang-client-0479434734';
const location = process.env.GEMINI_LOCATION || 'us-central1';

const vertexAI = new VertexAI({
  project: projectId,
  location: location
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'omniauthor-api',
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'OmniAuthor API',
    version: '1.0.0',
    description: 'AI-powered novel writing platform using Vertex AI Gemini',
    endpoints: {
      health: '/health',
      generate: '/api/generate',
      copilot: '/api/copilot'
    }
  });
});

// Test Gemini endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const model = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro-002',
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 1.0,
        topP: 0.95
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response.candidates[0].content.parts[0].text;

    res.json({ 
      success: true,
      response: response
    });
  } catch (error: any) {
    console.error('Error generating content:', error);
    res.status(500).json({ 
      error: 'Failed to generate content',
      message: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`\u{1F680} OmniAuthor API listening on port ${port}`);
  console.log(`\u{1F4CD} Project: ${projectId}`);
  console.log(`\u{1F310} Location: ${location}`);
});
