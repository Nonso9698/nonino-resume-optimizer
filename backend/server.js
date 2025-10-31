import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ---------- /api/generate (STEALTH + HUMAN VOICE; JD emphasis on PREVIOUS roles) ----------
app.post('/api/generate', async (req, res) => {
  try {
    const { jobDescription, currentResume, roleTitle } = req.body;
    if (!jobDescription || !currentResume || !roleTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🔄 Generating STEALTH/HUMAN optimized resume for:', roleTitle);

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
        temperature: 0.5,
      system: `You are an expert resume writer and career strategist operating in **STEALTH HUMAN MODE**.

OBJECTIVE:
Generate a resume that quietly aligns with the target role but feels human-written — conversational, understated, and authentic.

HARD CONSTRAINTS:
1. Keep job titles, companies, and dates EXACTLY as in the user's resume.
2. Keep the same structure and section order.
3. Verify realism for all metrics and timeframes (no inflated percentages or "zero findings").
4. Never include prompt or system text in your output.

STEALTH / HUMAN RULES:
5. Avoid copying or paraphrasing any 3+ word phrase from the job description.
6. Keep visible overlap with JD language under 10%.
7. Focus on how the candidate *thinks and delivers*, not just what tools they used.
8. Rotate domain terms naturally (e.g., “access review”, “role design”, “compliance testing”) and limit keyword repetition.
9. Use action verbs but vary rhythm — not every bullet should start with “Led,” “Managed,” or “Reduced.”
10. Keep metrics realistic and understated (e.g., “roughly 30%,” “shortened timelines,” “improved visibility”).
11. Replace AI-typical words like “proven,” “leverage,” “impactful,” “cutting-edge,” “passionate” with natural phrasing.
12. Prefer plain sentences: “Worked with business teams to…” instead of “Partnered cross-functionally to drive strategic alignment.”

PROFESSIONAL SUMMARY / CORE COMPETENCIES:
13. Write the summary in a natural professional voice — confident but conversational. Avoid sounding like a sales pitch or a JD summary.
14. Core competencies should be grouped in 10–12 concise, human-readable terms. Focus on categories (Risk & Control, Access Governance, Audit Readiness) rather than tool lists.

EXPERIENCE SECTIONS:
15. Most recent role: neutral and authentic (no JD-style echo).
16. Previous roles: carry natural alignment to the JD via paraphrased, outcome-first statements.
17. Avoid robotic repetition or perfect metric precision. Focus on cause → effect → context.

KEY ACHIEVEMENTS:
18. Keep 3–4 short bullets max. Mix quantitative and qualitative results (time saved, process improved, collaboration outcome).
19. Avoid corporate superlatives or AI-exaggerated claims (“world-class,” “unprecedented,” etc.).

COVER LETTER:
20. Simple, polite, human — 3 paragraphs max. Use contractions where natural (“I’ve,” “we’re”) and show interest without restating resume bullets.

OUTPUT FORMAT (VALID JSON ONLY):
{
  "optimizedResume": "full resume text rewritten per above rules",
  "coverLetter": "3 short paragraphs; conversational tone",
  "feedback": "brief summary of tone and realism improvements applied"
}`
,
        messages: [
          {
            role: 'user',
            content: `Target Role: ${roleTitle}

Job Description:
${jobDescription}

Current Resume:
${currentResume}

Please generate:
1) An optimized resume that keeps the EXACT job titles, companies, and dates but rewrites bullets to be outcome-led and human (no JD mirroring).
2) Emphasize JD alignment primarily in PREVIOUS roles; keep the MOST RECENT role natural/neutral.
3) Distribute terms and tools realistically across time; rotate synonyms.
4) A short cover letter (≤ 1/3 page) that avoids JD phrasing.
5) Brief feedback describing stealth and human-voice choices.

Return ONLY valid JSON in the format specified in the system prompt.`
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

    console.log('✅ STEALTH/HUMAN generation complete!');
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
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
});

// ---------- /api/generate-new (STEALTH progression + HUMAN VOICE; JD emphasis on PREVIOUS roles) ----------
app.post('/api/generate-new', async (req, res) => {
  try {
    const { jobDescription, currentResume, roleTitle } = req.body;
    if (!jobDescription || !currentResume || !roleTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🆕 Generating NEW STEALTH/HUMAN progression resume for:', roleTitle);

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
        temperature: 0.5,
        system: `You are a career storyteller creating realistic progression resumes that sound entirely human.

OBJECTIVE:
Generate a natural, credible career story that feels pre-existing and shows gradual growth toward the target role.

CONSTRAINTS:
1. Keep companies and dates EXACT.
2. Titles may be slightly adjusted only if needed for realism.
3. Keep achievements plausible; avoid inflated results or perfect metrics.
4. No copying 3+ word phrases from the job description.

STEALTH RULES:
5. Emphasize JD-aligned themes in earlier roles, but express them in plain, human language.
6. Keep the most recent role natural and believable — day-to-day ownership, not JD repetition.
7. Spread tools and processes realistically by era; no future tech in older roles.

HUMAN TONE:
8. Model the candidate’s voice based on their current resume — mirror sentence rhythm, vocabulary, and restraint.
9. Use short to medium sentences; vary openings and cadence.
10. Drop buzzwords (“leverage,” “passion,” “synergy,” “impactful,” etc.).
11. Use grounded metrics: “about 30%,” “roughly 15 hours,” “a few weeks,” instead of exact numbers.
12. Blend qualitative and quantitative results naturally.

SUMMARY & COMPETENCIES:
13. Write summaries that read like personal introductions — clear, modest, professional.
14. Keep 10–12 realistic competency areas. Prioritize clarity over keyword stuffing.

COVER LETTER:
15. Light, polite, conversational. One genuine interest line and one brief closing. No JD phrasing.

OUTPUT FORMAT (VALID JSON ONLY):
{
  "optimizedResume": "resume with natural progression, realistic scope, and human tone",
  "coverLetter": "3 short paragraphs, conversational, non-robotic",
  "feedback": "summary of humanization and realism adjustments"
}`
,
        messages: [
          {
            role: 'user',
            content: `Target Role: ${roleTitle}

Job Description:
${jobDescription}

Current Resume (KEEP companies/dates; keep titles unless a small clarification helps):
${currentResume}

Please generate:
1) A NEW resume preserving companies/dates (and titles unless a minor clarification is clearly beneficial).
2) Emphasize JD alignment in PREVIOUS roles; keep MOST RECENT role natural and not JD-like.
3) Distribute domain terms and tools realistically; rotate synonyms.
4) A short cover letter without JD mirroring.
5) Brief feedback on stealth progression + human-voice choices.

Return ONLY valid JSON in the format specified in the system prompt.`
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

    console.log('✅ New STEALTH/HUMAN progression generation complete!');
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
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
});

// For Vercel serverless
export default app;

// For local dev
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n✅ Backend Server Running!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔐 API key: ${process.env.ANTHROPIC_API_KEY ? 'Loaded ✓' : 'Missing ✗'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`);
  });
}
