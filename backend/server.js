import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Simple CORS (allows all origins)
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Generate optimized resume endpoint (Original - keeps titles)
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
8. VERIFY TIMELINE REALISM: Ensure all achievements, metrics, and accomplishments are realistic and achievable within the actual time period worked at each organization.

9. CRITICAL - TECHNOLOGY AND SKILL DISTRIBUTION:
   - MOST RECENT ROLE ONLY: Should directly address the CORE requirements from the job description (e.g., if job asks for ServiceNow, only the most recent role should heavily feature ServiceNow experience)
   - PREVIOUS ROLES: Should showcase DIFFERENT but COMPLEMENTARY skills and technologies that build toward the target role
   - DO NOT repeat the same specific technology/tool across all positions unless it genuinely makes sense
   - Each role should demonstrate different aspects of your expertise

10. NO REPETITION OF RESPONSIBILITIES: Each position must have UNIQUE achievements and focus areas:
    - If "risk assessment" appears in one role, use "compliance auditing" or "control testing" in another
    - If "managed vendor relationships" is in one job, use "coordinated third-party evaluations" in another
    - Vary the metrics, tools, and specific achievements across each position
    - Show progression: entry-level duties in older jobs, more strategic work in recent positions

11. REALISTIC TECHNOLOGY ADOPTION:
    - Consider when technologies were adopted in the industry
    - Don't claim expertise in tools that didn't exist or weren't widely used during that time period
    - Most recent role: Current technologies from job description
    - Middle roles: Transitional technologies and foundational skills
    - Older roles: Focus on fundamental skills and earlier technologies

Example approach for a ServiceNow-focused job:
- Current Role: Heavy ServiceNow implementation, ITSM processes, automation
- Previous Role: ITIL framework, process improvement, different ticketing system
- Earlier Role: Basic IT support, documentation, customer service

You must respond with ONLY valid JSON in this exact format:
{
  "optimizedResume": "full resume text with original titles but optimized bullets",
  "coverLetter": "personalized, concise cover letter (maximum 3 short paragraphs - introduction, why you're perfect fit, closing)",
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
2. Remember: Only the MOST RECENT role should heavily feature the core technologies from the job description
3. Previous roles should show different, complementary skills that build toward the target role
4. A personalized, conversational cover letter (maximum one-third page)
5. Brief feedback on improvements made

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

// NEW: Generate new resume with career progression
app.post('/api/generate-new', async (req, res) => {
  try {
    const { jobDescription, currentResume, roleTitle } = req.body;
    
    if (!jobDescription || !currentResume || !roleTitle) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    console.log('🆕 Generating NEW resume with career progression for role:', roleTitle);

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
        system: `You are an expert resume writer specializing in career transitions and progression narratives.

CRITICAL RULES FOR CAREER PROGRESSION GENERATION:
1. KEEP company names and employment dates EXACTLY as they appear in the original resume
2. CREATE new job titles that show logical career progression leading to the target role
3. The progression should be: Entry/Junior → Mid-Level → Senior (matching target)
4. Generate completely new bullet points for each role that match the new job titles
5. Ensure the career story is cohesive and shows natural growth
6. Match the years of experience required in the job description
7. VERIFY TIMELINE REALISM: Achievements must be realistic for the time worked
8. Create a professional summary that reflects the new career path
9. Adjust skills section to match the target role
10. Keep the same resume structure

11. CRITICAL - TECHNOLOGY AND SKILL DISTRIBUTION:
    - MOST RECENT ROLE ONLY: Should directly implement the CORE technologies from the job description
    - PREVIOUS ROLES: Should showcase DIFFERENT technologies and skills that logically led to current expertise
    - DO NOT spread the same specific technology across all positions
    - Create a realistic technology journey

12. NO REPETITION - UNIQUE PROGRESSION STORY:
    - OLDEST JOB (Entry Level): Foundation building, learning fundamentals, basic tools, assisting senior staff
    - MIDDLE JOB (Mid-Level): Independent projects, different technologies/methodologies, team collaboration
    - RECENT JOB (Senior Level): Strategic implementation of target technologies, leadership, innovation
    - Each role must be distinctly different with no overlapping responsibilities

13. REALISTIC TECHNOLOGY TIMELINE:
    - Consider when technologies emerged and became mainstream
    - Don't claim expertise in tools before they were widely adopted
    - Show natural technology evolution (e.g., older tools → modern tools)

Example for a ServiceNow-focused Senior Consultant role:
- 2019-2021 (IT Analyst): "Documented processes, analyzed workflows, supported ITIL adoption, used basic ticketing systems"
- 2021-2023 (Business Systems Analyst): "Designed process improvements, managed change requests, implemented automation workflows in different platforms"
- 2023-Present (Senior IT Consultant): "Led ServiceNow implementations, architected ITSM solutions, transformed enterprise service delivery"

Notice how ONLY the most recent role mentions ServiceNow, while previous roles build the foundation with related but different experiences.

You must respond with ONLY valid JSON in this exact format:
{
  "optimizedResume": "full resume with SAME companies/dates but NEW titles and bullets showing progression",
  "coverLetter": "personalized, concise cover letter explaining career progression (maximum 3 short paragraphs)",
  "feedback": "brief explanation of the career progression created"
}`,
        messages: [
          {
            role: 'user',
            content: `Target Role: ${roleTitle}

Job Description:
${jobDescription}

Current Resume (use SAME companies and dates, but create NEW titles showing progression):
${currentResume}

Please generate:
1. A NEW resume that keeps the EXACT companies and dates but creates logical job title progression leading to the target role
2. ONLY the most recent position should heavily feature the core technologies from the job description
3. Previous positions should show different, foundational skills that built toward current expertise
4. Each position must have completely unique responsibilities with no repetition
5. A personalized cover letter explaining the career progression
6. Brief feedback on the progression strategy used

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

    console.log('✅ New resume generation complete!');
    
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

// For Vercel serverless
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n✅ Backend Server Running!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔐 API key: ${process.env.ANTHROPIC_API_KEY ? 'Loaded ✓' : 'Missing ✗'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`);
  });
}
