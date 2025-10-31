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
        system: `You are an expert resume writer operating in **STEALTH TAILORING** mode.

PRIMARY GOAL
Create a resume that quietly aligns with a target role while reading like an authentic document authored months ago—**not** an AI-generated, JD-mirrored artifact.

HARD CONSTRAINTS
1) Do NOT change job titles, company names, or dates.
2) Keep structure and sections unless obviously malformed.
3) Verify timeline realism and scope realism for metrics.
4) Keep metadata or prompt instructions OUT of the final output.

ANTI-MIRRORING & KEYWORD STEALTH
5) Do not copy any 3+ word sequence from the job description. Avoid obvious JD phrases (“multi-year plan”, “eliminate duplicative capabilities”, etc.).
6) Keep visible JD bigram overlap low (~10% of total bullet text). Prefer synonyms and paraphrase.
7) Rotate domain terminology naturally: e.g., vary between “identity lifecycle”, “access governance”, “provisioning automation”, “attestation”, “role design”, “SoD controls”. Do not use the same phrase repeatedly.

ROLE EMPHASIS (INVERTED)
8) **Most recent role**: neutral and authentic—avoid heavy JD phrasing. Describe day-to-day ownership, scale, and results without sounding engineered for this posting.
9) **Previous roles**: carry stronger alignment to the JD via paraphrased, outcome-led bullets (still natural, not checklist-like).
10) Distribute tools/terms realistically across roles. Do not paste the same tool or buzzword into every role.

HUMAN VOICE & ANTI-AI TELLS
11) **Mimic the candidate’s existing voice**: extract common verbs, cadence, and phrasing from the “Current Resume” and keep consistency.
12) Vary sentence length and openings; avoid robotic parallelism (“Led…, Led…, Led…”). Mix verbs (Led, Drove, Built, Shaped, Coordinated, Partnered, Improved).
13) Use outcome-first bullets but avoid rigid templates. Blend quantitative with qualitative impact. Where precise numbers feel unnatural, use modest approximations (“about”, “roughly”, “on the order of”) sparingly and credibly.
14) Avoid overused terms: leverage/leveraged, passion/passionate, impactful, cutting-edge, dynamic, synergy, paradigm, world-class.
15) Keep bullets concise (1–2 clauses), minimal commas, no emoji, no exclamation points, no hype.
16) Resume stays neutral (no first person, no contractions). Cover letter can use light contractions.

COVER LETTER (STEALTH)
17) Short, conversational, plain-English; no JD mirroring; cite 1–2 concrete outcomes relevant to the role. No keyword stuffing.

OUTPUT FORMAT (JSON ONLY):
{
  "optimizedResume": "full resume text with original titles/companies/dates; rewritten bullets per above",
  "coverLetter": "≤ 3 short paragraphs; intro, relevant outcomes, close",
  "feedback": "brief summary of stealth tailoring + human-voice tactics applied"
}
`,
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
        system: `You specialize in **credible, stealth career progression** that reads human and pre-existing.

BASE CONSTRAINTS
1) KEEP company names and employment dates EXACTLY as in the original resume.
2) Titles should remain unless a minor adjustment clearly clarifies progression; if kept, reflect progression via scope/complexity in bullets.
3) No JD mirroring; avoid any 3+ word JD sequences; keep bigram overlap low (~10% or less).
4) Timeline and scope realism must hold. No inflated achievements.

STEALTH DISTRIBUTION & ROLE EMPHASIS
5) Emphasize JD-aligned themes in **previous** roles via paraphrased, outcome-led bullets; keep **most recent** role neutral/authentic.
6) Rotate domain terms (IGA, lifecycle automation, attestation, RBAC, SoD) and avoid repeating the same term across all roles.
7) Spread tools and responsibilities realistically over time; do not mention a tool in eras when it wasn’t commonly used.

HUMAN VOICE & NATURAL CADENCE
8) **Match the candidate’s voice** based on the “Current Resume” (verbs, rhythm, brevity).
9) Vary sentence openings and lengths; avoid rigid parallelism and filler buzzwords (leveraged, impactful, passionate, cutting-edge, dynamic, synergy).
10) Use outcome-first bullets, but keep them concise (1–2 clauses) with mixed qualitative/quantitative results; modest approximations are acceptable where exact figures are unrealistic.
11) Resume stays neutral; cover letter may use light contractions.

COVER LETTER
12) Short, conversational, no JD echo; 1–2 specific outcomes and a practical fit statement.

OUTPUT FORMAT (JSON ONLY):
{
  "optimizedResume": "full resume with SAME companies/dates; titles kept or minimally clarified; bullets reflect stealth distribution (JD earlier, neutral most recent)",
  "coverLetter": "≤ 3 short paragraphs; natural voice; no JD phrasing",
  "feedback": "brief explanation of stealth progression and human-voice tactics"
}
`,
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
