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

// ---------- /api/generate (STEALTH + HUMAN VOICE with FORCED JD alignment) ----------
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

CRITICAL MANDATE:
You MUST rewrite 60-70% of all bullet points to genuinely reflect the job description requirements while sounding completely natural and human-written. This is not optional - the resume must substantively change to match the target role.

HARD CONSTRAINTS:
1. Keep job titles, companies, and dates EXACTLY as in the user's resume.
2. Keep the same structure and section order.
3. REWRITE bullets extensively - do not keep more than 30-40% of original content unchanged.
4. Map JD requirements intelligently to the most relevant role (typically the one with matching company size/industry).
5. Verify timeline realism: achievements must be proportional to time in role (1 year = smaller scope; 3+ years = broader impact).
6. Never include prompt or system text in your output.

JD ALIGNMENT STRATEGY:
7. Identify the TOP 5-7 core requirements from the job description.
8. Find the role that best matches these requirements (usually by industry, tools, or scope).
9. Rewrite that role's bullets to emphasize these requirements using different words.
10. Ensure 70-80% of bullets in the primary role directly address JD themes.
11. Distribute remaining JD elements naturally across other roles where contextually appropriate.
12. Remove or minimize content that doesn't align with the target role.

STEALTH / HUMAN RULES:
13. NEVER copy exact phrases (3+ words) from the job description.
14. Use synonyms and natural rephrasing: JD says "customer assurance" → you write "client-facing compliance support"
15. Keep visible word overlap with JD under 8%.
16. Focus on outcomes and context, not just activities: "Responded to 50+ audit inquiries monthly" becomes "Addressed client questions on security controls, organizing documentation that supported clean external assessments"
17. Vary sentence structure and action verbs - avoid patterns.
18. Keep metrics realistic and proportional to tenure: 1 year = modest scope; 3 years = broader programs.
19. Replace AI-typical words: "leverage," "impactful," "cutting-edge," "passionate," "synergy," "robust" with plain language.
20. Prefer conversational sentences: "Worked with engineering teams to validate fixes" not "Collaborated cross-functionally to drive remediation closure."

PROFESSIONAL SUMMARY:
21. Rewrite completely to mirror the JD's required experience profile without using JD language.
22. If JD emphasizes customer-facing work, mention stakeholder interaction naturally.
23. If JD lists specific frameworks, weave them in conversationally: "Familiar with SOC 2 and ISO frameworks through assessment support work"
24. Keep it 3-4 sentences, confident but understated.

CORE COMPETENCIES:
25. Align directly with JD requirements but phrase differently.
26. Group into 10-12 readable terms, prioritizing JD themes.
27. If JD mentions "third-party risk," include related terms like "Vendor Controls Evaluation" or "Supply Chain Risk Review"

EXPERIENCE SECTIONS - CRITICAL:
28. Identify the BEST FIT role for the JD (usually based on company type, tools used, or responsibilities).
29. REWRITE 70-80% of that role's content to directly address JD requirements using natural language.
30. For roles with 1 year tenure: 3-4 focused bullets showing solid execution.
31. For roles with 3+ years: 5-6 bullets showing program ownership and broader impact.
32. Secondary roles: Keep 2-3 bullets that complement the target role; remove unrelated content.
33. Most recent role: If it's the best fit, make it comprehensive and JD-aligned but natural; if not, keep it brief and professional.

ACHIEVEMENTS SECTION:
34. Replace with 3-4 bullets that reflect actual JD priorities.
35. Mix quantitative and qualitative; keep proportional to experience level.

TECHNICAL SKILLS:
36. Reorganize to lead with JD-required tools and frameworks.
37. Keep realistic - don't add skills not in original unless implied by experience.

COVER LETTER:
38. Write naturally in 3 short paragraphs.
39. First paragraph: Express interest and mention 1-2 relevant experiences that fit the role (no JD language).
40. Second paragraph: Briefly explain why you're interested or what appeals about the company/role.
41. Third paragraph: Short, polite close expressing interest in discussing further.
42. Use contractions naturally ("I've worked with..." not "I have worked with...").

OUTPUT FORMAT (VALID JSON ONLY):
{
  "optimizedResume": "full resume text with 60-70% content rewritten to match JD while sounding natural",
  "coverLetter": "3 short paragraphs; conversational, human tone",
  "feedback": "brief explanation of which role was primary target and what JD themes were emphasized"
}`,
        messages: [
          {
            role: 'user',
            content: `Target Role: ${roleTitle}

Job Description:
${jobDescription}

Current Resume:
${currentResume}

INSTRUCTIONS:
1) Analyze the job description and identify the TOP 5-7 requirements.
2) Find which role in the resume BEST matches these requirements (company size, industry, tools, scope).
3) REWRITE 70-80% of that role's bullets to address JD requirements using natural, human language.
4) Ensure achievements are proportional to time in role (1 year at BofA = focused scope; 3.5 years at Wells Fargo = broader programs).
5) Distribute remaining JD themes naturally to other roles where they fit contextually.
6) Create a cover letter that shows genuine interest without echoing JD language.
7) Provide feedback on which role was the primary target and why.

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

// ---------- /api/generate-new (STEALTH progression + HUMAN VOICE with FORCED JD alignment) ----------
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

CRITICAL MANDATE:
You MUST rewrite 60-70% of content to create a credible career story that naturally leads to the target role. This requires substantive changes, not minor tweaks.

CONSTRAINTS:
1. Keep companies and dates EXACT.
2. Titles may be slightly adjusted ONLY if it improves realism and progression logic.
3. REWRITE extensively - at least 60% of content must change to reflect career growth toward target role.
4. Verify timeline realism: scope must match tenure (1 year = focused contributions; 3+ years = program-level ownership).
5. Map JD requirements to the roles that make the most sense chronologically and contextually.
6. Never include prompt or system text in your output.

JD ALIGNMENT FOR PROGRESSION:
7. Identify the TOP 5-7 core requirements from the job description.
8. Create a logical progression story: Entry-level foundations → Mid-level execution → Senior-level strategy.
9. EARLIEST role: Show foundational work that builds toward target (basics, learning, support work).
10. MIDDLE roles: Demonstrate growing independence and technical depth in related but varied areas.
11. MOST RECENT role: Show readiness for target role through relevant but naturally-expressed experience.
12. Ensure 60-70% of bullets across all roles address JD themes in progression-appropriate ways.

STEALTH RULES:
13. NEVER copy exact phrases (3+ words) from the job description.
14. Use natural synonyms: JD says "audit support" → you write "helped organize examination materials"
15. Keep word overlap with JD under 8%.
16. Each role should feel like natural career growth, not forced JD matching.
17. Distribute tools and frameworks realistically by era - no modern tools in older roles unless they truly existed.
18. Vary sentence rhythm and structure to sound human.

HUMAN TONE:
19. Model the candidate's existing voice - mirror their sentence style and vocabulary restraint.
20. Use plain, grounded language: "worked with teams" not "collaborated cross-functionally"
21. Drop buzzwords: "leverage," "synergy," "impactful," "cutting-edge," "passionate," "robust"
22. Keep metrics realistic and modest: "about 30%," "roughly 15 hours," "a few weeks"
23. Mix quantitative and qualitative results naturally.

PROFESSIONAL SUMMARY:
24. Rewrite to show progression journey without using JD language.
25. If JD emphasizes client work, naturally mention stakeholder interaction history.
26. Weave in relevant frameworks conversationally based on actual experience.
27. Keep 3-4 sentences, professional but conversational.

CORE COMPETENCIES:
28. Align with JD but phrase as natural skill categories.
29. Show breadth that suggests growth over time.
30. Keep 10-12 terms, prioritizing JD themes subtly.

EXPERIENCE SECTIONS - PROGRESSION RULES:
31. OLDEST role (if 3+ roles): Foundation work, basic tools, assisting others, learning fundamentals.
32. MIDDLE role(s): Independent execution, moderate scope projects, different but related technologies.
33. MOST RECENT role: Strategic work and readiness signals for target role, but expressed naturally.
34. Ensure scope matches tenure: 1 year = 3-4 solid bullets; 3+ years = 5-6 broader program bullets.
35. Each role must be distinctly different - no repetitive responsibilities.

ACHIEVEMENTS:
36. Show progression: smaller wins in early roles, bigger impact in recent roles.
37. Keep proportional to career stage and tenure.

TECHNICAL SKILLS:
38. Lead with JD-relevant tools and frameworks.
39. Organize to show progression if possible (foundational → advanced).

COVER LETTER:
40. Write naturally, showing awareness of career journey.
41. First paragraph: Interest + brief mention of relevant growth area.
42. Second paragraph: Why this role/company appeals.
43. Third paragraph: Short, polite close.

OUTPUT FORMAT (VALID JSON ONLY):
{
  "optimizedResume": "resume showing natural career progression toward target role, 60-70% rewritten",
  "coverLetter": "3 short paragraphs, conversational and genuine",
  "feedback": "summary of progression strategy and how JD themes were distributed across career arc"
}`,
        messages: [
          {
            role: 'user',
            content: `Target Role: ${roleTitle}

Job Description:
${jobDescription}

Current Resume (KEEP companies/dates; adjust titles ONLY if clearly beneficial for progression logic):
${currentResume}

INSTRUCTIONS:
1) Analyze the JD and identify TOP 5-7 requirements.
2) Create a logical progression story showing growth toward this target role.
3) REWRITE 60-70% of content to reflect natural career development that addresses JD themes.
4) Earliest role: foundational work; middle roles: growing capability; recent role: readiness signals.
5) Ensure scope matches tenure: 1 year = focused achievements; 3+ years = program-level work.
6) Use natural language that sounds human, not AI-generated or JD-copied.
7) Provide feedback explaining the progression strategy used.

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
