import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel domains and localhost
    if (
      origin.includes('.vercel.app') || 
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    
    // Block other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

// Handle preflight requests explicitly
app.options('*', cors());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/generate', async (req, res) => {
  try {
    const { jobDescription, currentResume, roleTitle } = req.body;

    if (!jobDescription || !currentResume || !roleTitle) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    console.log('🔄 Generating optimized resume for role:', roleTitle);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        temperature: 0.7,
        system: `You are an expert resume writer and career coach. Your task is to optimize resumes for specific job applications.

CRITICAL RULES:
1. NEVER change job titles, company names, or dates from the original resume
2. ONLY rewrite bullet points to align with the target job description
3. Extract exact job titles, companies, and dates from the user's resume and keep them unchanged
4. Use strong action verbs and quantifiable achievements
5. Incorporate keywords from the job description naturally
6. Focus on results and measurable outcomes
7. Keep the same resume structure and sections

You must respond with ONLY valid JSON in this exact format:
{
  "optimizedResume": "full resume text with original titles but optimized bullets",
  "coverLetter": "personalized cover letter (max one-third page)",
  "feedback": "brief summary of improvements made"
}`,
        messages: [
          {
            role: 'user',
            content: `Target Role: ${roleTitle}

Job Description:
${jobDescription}

Current Resume:
${currentResume}

Please generate:
1. An optimized resume that keeps the EXACT job titles, companies, and dates but rewrites bullets to align with the job description
2. A personalized, conversational cover letter (maximum one-third page)
3. Brief feedback on improvements made

Respond with ONLY valid JSON in the format specified in the system prompt.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    console.log('✅ Generation complete!');

    res.json({
      success: true,
      data: {
        optimizedResume: parsedContent.optimizedResume,
        coverLetter: parsedContent.coverLetter,
        feedback: parsedContent.feedback
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ 
      error: error.message || 'Failed to generate content' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ Backend Server Running!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔐 API key: ${process.env.ANTHROPIC_API_KEY ? 'Loaded ✓' : 'Missing ✗'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`);
});
