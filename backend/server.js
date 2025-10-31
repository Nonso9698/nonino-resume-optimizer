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

⚠️ ENFORCEMENT: If you do not follow these rules, the output will be rejected and you will need to regenerate.

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
18. VOICE VARIATION REQUIREMENTS (critical for authenticity):
    - Within each role, vary sentence structure: some bullets with metrics, some descriptive, some action-focused
    - Alternate between "I did X" style and "X resulted in Y" style
    - Mix technical depth: some bullets technical, some business-focused, some hybrid
    - Avoid starting consecutive bullets with similar verbs (no "Supported... Supported... Developed...")
    - Every 2nd or 3rd bullet should use different grammatical structure
    - Vary opening words across all bullets in the resume (track verb usage)
19. Keep metrics realistic and proportional to tenure: 1 year = modest scope; 3 years = broader programs.
20. Replace AI-typical words: "leverage," "impactful," "cutting-edge," "passionate," "synergy," "robust" with plain language.
21. FORBIDDEN PHRASE COMBINATIONS (never use these together in the same role):
    - "risk-informed" + "decision-making" (use "decisions based on security priorities" instead)
    - "security-focused" + "culture" OR just "security-focused" alone (use "security awareness" or "security understanding" instead)
    - "business enablement" + "needs" (use "business requirements" or "operational needs" instead)
    - "cross-functional" + "collaboration" + "stakeholders" in same bullet
    - More than 2 instances of "stakeholder(s)" in any single role - COUNT CAREFULLY
    - "drive" or "driving" more than once per role
    - "proven track record" (extremely AI-typical)
    - "advocate for" (sounds corporate, use "push for" or "help with" instead)
    - Starting more than 2 bullets in a role with similar verbs (Support... Support... = BAD)
22. Prefer conversational sentences: "Worked with engineering teams to validate fixes" not "Collaborated cross-functionally to drive remediation closure."

PROFESSIONAL SUMMARY:
21. Rewrite completely to mirror the JD's required experience profile without using JD language.
22. If JD emphasizes customer-facing work, mention stakeholder interaction naturally.
23. If JD lists specific frameworks, weave them in conversationally: "Familiar with SOC 2 and ISO frameworks through assessment support work"
24. Keep it 3-4 sentences, confident but understated.

AUTHENTICITY MARKERS (make it genuinely human):
25. Occasionally use slightly less polished phrasing: "helped coordinate" vs "coordinated", "worked on" vs "led"
26. Mix metric precision across the entire resume: some exact (33%), some approximate (roughly one-third), some qualitative (significantly improved)
27. Include 1-2 bullets per role that focus on process/collaboration without metrics - not everything needs a number
28. Vary accomplishment magnitude realistically: not every role should have "transformational" impact; some bullets can show solid, unglamorous work
29. Use realistic time qualifiers: "over 18 months," "within the first quarter," "during 2023"
30. Occasionally mention team context: "within 8-person team," "under senior manager oversight"

CORE COMPETENCIES:
31. Align directly with JD requirements but phrase differently - do not copy exact JD phrases.
32. Group into 10-12 readable terms, prioritizing JD themes subtly.
33. If JD mentions "third-party risk," include related terms like "Vendor Controls Evaluation" or "Supply Chain Risk Review"
34. Mix technical skills with soft skills naturally (not all technical, not all soft).
35. Order strategically: lead with most relevant to JD, but include 1-2 unexpected but related skills to avoid obvious pattern-matching.

EXPERIENCE SECTIONS - CRITICAL:
36. Most recent/current role: Should show STRONGEST natural alignment to JD through authentic, outcome-focused statements. Use 4-5 bullets.
37. Previous roles: Provide complementary foundation skills that logically led to current capabilities, using varied language. Scale bullets to tenure.
38. For roles with 6 months or less: 3 bullets maximum - highlight key contributions only.
39. For roles with 1 year tenure: 4 bullets maximum - focused and impactful.
40. For roles with 3+ years: 5 bullets maximum - show breadth but avoid bloat.
41. Current role should have 1-2 more bullets than previous roles to emphasize recent relevance.
42. Identify industry context from JD (healthcare, finance, tech) and prominently feature it in most recent role's first 1-2 bullets, making it feel incidental not forced.

ACHIEVEMENTS SECTION:
43. Replace with 3-4 bullets that reflect actual JD priorities.
44. Mix quantitative and qualitative; keep proportional to experience level.
45. Not every achievement needs to be groundbreaking - include solid, workmanlike accomplishments too.

TECHNICAL SKILLS:
46. Reorganize to lead with JD-required tools and frameworks.
47. Keep realistic - don't add skills not in original unless clearly implied by experience.
48. Group related skills together naturally (e.g., "Cloud: AWS, Azure" not scattered).

COVER LETTER:
49. Write naturally in 3 short paragraphs.
50. First paragraph: Express interest and mention 1-2 relevant experiences that fit the role (no JD language).
51. Second paragraph: Briefly explain why you're interested or what appeals about the company/role.
52. Third paragraph: Short, polite close expressing interest in discussing further.
53. Use contractions naturally ("I've worked with..." not "I have worked with...").
54. Avoid repeating exact phrases from resume - show same concepts differently.

CONCRETE EXAMPLES - STUDY THESE:

❌ BAD (AI-generated, detectable):
- "Support information security risk management for healthcare clients by conducting HITRUST assessments"
- "Advocate for security risk management through vendor evaluation processes"
- "Drive security compliance through gap assessments"
- "Manage risk dashboards in Splunk that deliver practical security metrics"

✅ GOOD (Human-written, natural):
- "Work with healthcare clients to evaluate security risks in their cloud setups, helping teams understand what needs fixing and why"
- "Run vendor security reviews for 50+ suppliers, scoring their controls and tracking where they need to improve"
- "Check payment systems for PCI compliance gaps, then coordinate with IT to close issues within deadlines"
- "Built Splunk dashboards that show execs where we stand on compliance without overwhelming them with details"

❌ BAD - Professional Summary:
"Proven track record building risk-focused cultures through cross-functional collaboration and delivering quantitative risk metrics to technical and business audiences."

✅ GOOD - Professional Summary:
"Experienced working with IT, legal, and business teams to improve security awareness while creating clear risk reports for both technical staff and executives."

VOICE PATTERN EXAMPLES:

❌ BAD (repetitive verbs):
- Support information security risk programs...
- Support stakeholder engagement...
- Advocate for security risk management...

✅ GOOD (varied openings):
- Work with healthcare teams to assess cloud security risks...
- Run vendor security reviews covering 50+ critical suppliers...
- Help IT teams fix compliance gaps through targeted remediation plans...
- Built risk dashboards that eliminated one-third of manual reporting...

Remember: REAL humans don't write in perfect corporate patterns. They vary their language, use conversational tone, and don't repeat the same structures.

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

⚠️ ENFORCEMENT: If you do not follow these rules, the output will be rejected and you will need to regenerate.

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
19. VOICE VARIATION REQUIREMENTS:
    - Within each role, vary sentence structure and depth
    - Avoid starting consecutive bullets with similar verbs
    - Mix technical, business-focused, and collaborative bullets
    - Track verb usage across entire resume to ensure variety

HUMAN TONE:
20. Model the candidate's existing voice - mirror their sentence style and vocabulary restraint.
21. Use plain, grounded language: "worked with teams" not "collaborated cross-functionally"
22. Drop buzzwords: "leverage," "synergy," "impactful," "cutting-edge," "passionate," "robust"
23. FORBIDDEN PHRASE COMBINATIONS:
    - "risk-informed" + "decision-making"
    - "security-focused" + "culture" OR just "security-focused" alone
    - "business enablement" + "needs"
    - "cross-functional" + "collaboration" + "stakeholders" in same bullet
    - More than 2 instances of "stakeholder(s)" in any single role - COUNT CAREFULLY
    - "proven track record" (extremely AI-typical)
    - "advocate for" (use "push for" or "help with" instead)
    - Starting more than 2 bullets in a role with similar verbs
24. Keep metrics realistic and modest: "about 30%," "roughly 15 hours," "a few weeks"
25. Mix quantitative and qualitative results naturally.
26. AUTHENTICITY MARKERS:
    - Occasionally use less polished phrasing: "helped coordinate" vs "coordinated"
    - Include 1-2 bullets per role without metrics
    - Vary accomplishment magnitude - not everything is transformational
    - Use realistic time qualifiers and team context

PROFESSIONAL SUMMARY:
27. Rewrite to show progression journey without using JD language.
28. If JD emphasizes client work, naturally mention stakeholder interaction history.
29. Weave in relevant frameworks conversationally based on actual experience.
30. Keep 3-4 sentences, professional but conversational.

CORE COMPETENCIES:
31. Align with JD but phrase as natural skill categories - don't copy exact JD phrases.
32. Show breadth that suggests growth over time.
33. Keep 10-12 terms, prioritizing JD themes subtly.
34. Mix technical and soft skills; include 1-2 unexpected but related skills.

EXPERIENCE SECTIONS - PROGRESSION RULES:
35. OLDEST role (if 3+ roles): Foundation work, basic tools, assisting others, learning fundamentals. 2-3 bullets max.
36. MIDDLE role(s): Independent execution, moderate scope projects, different but related technologies. 3-4 bullets.
37. MOST RECENT role: Strategic work and readiness signals for target role, expressed naturally. 4-5 bullets - should be most substantial.
38. Ensure scope matches tenure: 6 months = 3 bullets; 1 year = 4 bullets; 3+ years = 5 bullets max.
39. Each role must be distinctly different - no repetitive responsibilities.
40. Identify industry context from JD and feature it prominently in most recent role's first 1-2 bullets.

ACHIEVEMENTS:
41. Show progression: smaller wins in early roles, bigger impact in recent roles.
42. Keep proportional to career stage and tenure.
43. Include some solid, unglamorous accomplishments - not everything is transformational.

TECHNICAL SKILLS:
44. Lead with JD-relevant tools and frameworks.
45. Organize to show progression if possible (foundational → advanced).
46. Group related skills naturally.

COVER LETTER:
47. Write naturally showing awareness of career journey.
48. First paragraph: Interest + brief mention of relevant growth area (no JD language).
49. Second paragraph: Why this role/company appeals.
50. Third paragraph: Short, polite close.
51. Use contractions; avoid repeating exact resume phrases.

CONCRETE EXAMPLES - STUDY THESE:

❌ BAD (AI-generated, detectable):
- "Support information security risk management for healthcare clients"
- "Advocate for security risk management through vendor evaluation"
- "Drive security compliance through gap assessments"

✅ GOOD (Human-written, natural):
- "Work with healthcare clients to evaluate security risks in their cloud setups"
- "Run vendor security reviews for 50+ suppliers, scoring controls and tracking improvements"
- "Check payment systems for PCI gaps, then coordinate with IT to close issues"

Remember: Vary your verb usage, use conversational tone, and avoid perfect corporate patterns.

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

// ---------- /api/adjust (Post-generation adjustments) ----------
app.post('/api/adjust', async (req, res) => {
  try {
    const { adjustmentRequest, currentResume, currentCoverLetter, jobDescription, roleTitle, documentType } = req.body;
    
    if (!adjustmentRequest || !currentResume || !roleTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🔧 Processing adjustment request for:', documentType);

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
        system: `You are an expert resume editor making targeted adjustments based on user feedback.

CRITICAL RULES:
1. Make ONLY the changes requested by the user - do not modify other parts unless necessary for consistency.
2. Maintain the same format, structure, and style as the original document.
3. Keep all company names, dates, and unrelated content exactly as provided.
4. If adjusting bullet points, maintain the human, conversational tone established in the original.
5. Ensure changes remain realistic and proportional to the role's timeframe.
6. Keep the stealth, natural writing style - no obvious AI language or JD copying.

ADJUSTMENT TYPES:
- Content changes: Rewrite specific sections, add/remove details, change emphasis
- Tone adjustments: Make more/less formal, more confident, more modest
- Technical fixes: Correct errors, improve clarity, adjust metrics
- Focus shifts: Emphasize different skills, change priority of information
- Length adjustments: Expand or condense specific sections

If the user's request is unclear, make your best interpretation while staying conservative with changes.

OUTPUT FORMAT (VALID JSON ONLY):
{
  "adjustedResume": "the resume with requested changes applied",
  "adjustedCoverLetter": "the cover letter with requested changes applied (if applicable)",
  "changesSummary": "brief explanation of what was changed and why"
}`,
        messages: [
          {
            role: 'user',
            content: `Target Role: ${roleTitle}

Job Description (for context):
${jobDescription || 'Not provided'}

Current Resume:
${currentResume}

${currentCoverLetter ? `Current Cover Letter:\n${currentCoverLetter}\n` : ''}

User's Adjustment Request:
${adjustmentRequest}

Document Type to Adjust: ${documentType || 'both'}

Please make the requested adjustments while keeping everything else intact. Maintain the human, natural tone and realistic scope. Return ONLY valid JSON in the format specified in the system prompt.`
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

    console.log('✅ Adjustment complete!');
    res.json({
      success: true,
      data: {
        adjustedResume: parsedContent.adjustedResume,
        adjustedCoverLetter: parsedContent.adjustedCoverLetter || currentCoverLetter,
        changesSummary: parsedContent.changesSummary
      }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to process adjustment' });
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
