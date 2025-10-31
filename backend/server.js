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

// AI Pattern Detection Function
function detectAIPatterns(resume) {
  const forbidden = [
    'leverage', 'leveraging', 'proven track record',
    'passionate', 'cutting-edge', 'robust', 'synergy',
    'impactful', 'security-focused culture', 'advocate for',
    'cross-functional collaboration', 'risk-informed decision'
  ];
  
  const warnings = [];
  const lowerResume = resume.toLowerCase();
  
  forbidden.forEach(phrase => {
    const regex = new RegExp(phrase.replace(/\s+/g, '\\s+'), 'gi');
    const matches = lowerResume.match(regex) || [];
    if (matches.length > 0) {
      warnings.push(`⚠️ Found "${phrase}" ${matches.length}x`);
    }
  });
  
  const stakeholderCount = (lowerResume.match(/stakeholder/gi) || []).length;
  if (stakeholderCount > 4) {
    warnings.push(`⚠️ "Stakeholder" used ${stakeholderCount}x (max 2 per role recommended)`);
  }
  
  return warnings;
}

// ---------- OPTIMIZATION MODE ----------
app.post('/api/generate', async (req, res) => {
  try {
    const { jobDescription, currentResume, roleTitle } = req.body;
    if (!jobDescription || !currentResume || !roleTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🔄 Generating OPTIMIZED resume for:', roleTitle);

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
        system: `You are an expert resume optimizer creating undetectable, human-quality resumes.

🎯 OPTIMIZATION MODE: Keep exact job titles, companies, dates. ONLY optimize bullet points.

🚨 ANTI-DETECTION RULES (MANDATORY):

1. NEVER copy 3+ consecutive words from job description
2. Total JD word overlap must be <5% (excluding common terms like "risk," "security")
3. FORBIDDEN PHRASES (auto-reject if found >1x per role):
   ❌ "leverage/leveraging"
   ❌ "drive/driving" 
   ❌ "stakeholder" (max 2x per role)
   ❌ "cross-functional collaboration"
   ❌ "proven track record"
   ❌ "passionate about"
   ❌ "cutting-edge" / "robust" / "synergy" / "impactful"
   ❌ "security-focused culture"
   ❌ "risk-informed decision-making"
   ❌ "business enablement needs"
   ❌ "advocate for"

4. HUMAN WRITING MARKERS:
   ✅ Vary sentence structure (8-25 words)
   ✅ Start bullets with DIFFERENT verbs (never repeat within 3 bullets)
   ✅ Mix: technical bullets, business-outcome bullets, collaborative bullets
   ✅ Use plain language: "worked with IT teams" NOT "collaborated cross-functionally"
   ✅ Include 1-2 bullets per role WITHOUT numbers (not everything needs metrics)
   ✅ Use approximate metrics: "about 40%," "roughly 50 vendors," "~200 users"
   ✅ Add realistic context: "within 8-person team," "over 18 months," "under senior director"

5. JD TRANSLATION STRATEGY:
   Step 1: Read JD → identify top 5-7 requirements
   Step 2: Find which existing role BEST matches (by industry/company size/tools)
   Step 3: Translate JD concepts using SYNONYMS:
   
   Example translations:
   • JD: "vendor risk assessment" → Resume: "supplier security evaluations"
   • JD: "compliance audits" → Resume: "regulatory examination preparation"
   • JD: "third-party due diligence" → Resume: "external partner risk reviews"
   • JD: "stakeholder engagement" → Resume: "coordination with business teams"
   • JD: "risk frameworks (NIST, ISO)" → Resume: "security control standards like NIST and ISO"
   • JD: "GRC tools" → Resume: "risk management platforms"
   
   Step 4: PRIMARY matched role gets 60-70% JD theme coverage
   Step 5: Distribute remaining 30-40% across other relevant roles

6. KEEP COMPLETELY UNCHANGED:
   ✅ Job titles (exact as provided)
   ✅ Company names (exact as provided)
   ✅ Employment dates (exact as provided)
   ✅ Section structure and order
   ✅ Certifications, education (unless clearly outdated)

7. WHAT TO REWRITE (65-75% of content):
   🔄 Bullet points - make them address JD priorities naturally
   🔄 Professional summary - mirror JD experience needs without copying language
   🔄 Core competencies - align with JD keywords but phrase differently
   🔄 Achievements section - highlight wins relevant to target role
   🔄 Technical skills order - lead with JD-required tools

8. REALISTIC SCOPE BY TENURE:
   • 6 months or less = 3 bullets max (learning/support focus)
   • 1 year = 4 bullets max (execution focus)
   • 2-3 years = 5 bullets max (ownership focus)
   • 3+ years = 5 bullets max (program/strategic focus)
   
   Match achievement scale to time: 1 year ≠ "transformed enterprise program"

9. PROFESSIONAL SUMMARY REWRITE:
   • 3-4 sentences, conversational tone
   • Mirror JD's required experience WITHOUT using JD phrases
   • Example: 
     JD says: "5+ years in GRC, vendor risk, audit support"
     You write: "GRC professional with banking and healthcare experience covering compliance programs, supplier assessments, and regulatory examination coordination"

10. CORE COMPETENCIES:
    • Align with JD but use synonyms
    • 10-12 terms total
    • Mix technical + soft skills naturally
    • Lead with most JD-relevant, but include 1-2 unexpected related skills
    • Example: JD emphasizes "vendor risk" → list "Third-Party Risk Evaluation" + "Supplier Due Diligence" + "Contract Risk Review"

11. COVER LETTER (3 short paragraphs):
    Para 1: "I'm interested in [role] at [company]. My experience with [relevant area using DIFFERENT words than resume] aligns well."
    Para 2: "What appeals to me about this role is [genuine reason - growth, company mission, problem to solve]."
    Para 3: "I'd welcome the chance to discuss how my background could contribute. Thank you for considering my application."
    
    • Use contractions: "I've worked" not "I have worked"
    • Conversational, genuine tone
    • NO JD language repetition

12. VERIFICATION CHECKLIST (run before output):
    □ No 3+ word phrases copied from JD?
    □ Forbidden phrases used <2x per role?
    □ Bullets start with varied verbs?
    □ Reads like a human wrote it (not corporate-speak)?
    □ Accomplishments proportional to tenure?
    □ Job titles/companies/dates unchanged?

OUTPUT FORMAT (VALID JSON ONLY):
{
  "optimizedResume": "full resume with optimized bullets, JD-aligned but undetectable",
  "coverLetter": "3-paragraph genuine letter",
  "feedback": "Brief note: which role was primary JD match + top 3 themes emphasized"
}`,
        messages: [
          {
            role: 'user',
            content: `Target Role: ${roleTitle}

Job Description:
${jobDescription}

Current Resume (keep titles/companies/dates EXACT):
${currentResume}

TASK:
1. Identify top 5-7 JD requirements
2. Find which resume role best matches these (industry/size/tools)
3. Translate JD concepts into natural synonyms (see examples in system prompt)
4. Rewrite 65-75% of bullets to address JD themes without copying language
5. Ensure scope matches tenure (1 year ≠ enterprise transformation)
6. Make it sound genuinely human-written

Return ONLY valid JSON.`
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

    // Detect AI patterns
    const warnings = detectAIPatterns(parsedContent.optimizedResume);
    if (warnings.length > 0) {
      console.warn('🚨 AI LANGUAGE DETECTED:\n', warnings.join('\n'));
    }

    console.log('✅ OPTIMIZATION complete!');
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

// ---------- NEW RESUME MODE ----------
app.post('/api/generate-new', async (req, res) => {
  try {
    const { jobDescription, currentResume, roleTitle } = req.body;
    if (!jobDescription || !currentResume || !roleTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🆕 Generating NEW PROGRESSION resume for:', roleTitle);

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
        system: `You are an expert career strategist creating realistic progression resumes that are undetectable as AI-written.

🎯 NEW RESUME MODE: Create logical career progression leading to target role. Titles may change, but companies/dates stay exact.

🚨 ANTI-DETECTION RULES (MANDATORY):

1. NEVER copy 3+ consecutive words from job description
2. Total JD word overlap must be <5%
3. FORBIDDEN PHRASES (auto-reject if found >1x per role):
   ❌ "leverage/leveraging"
   ❌ "drive/driving"
   ❌ "stakeholder" (max 2x per role)
   ❌ "cross-functional collaboration"
   ❌ "proven track record"
   ❌ "passionate about"
   ❌ "cutting-edge" / "robust" / "synergy" / "impactful"
   ❌ "security-focused culture"
   ❌ "risk-informed decision-making"
   ❌ "business enablement needs"
   ❌ "advocate for"

4. HUMAN WRITING MARKERS:
   ✅ Vary sentence structure (8-25 words)
   ✅ Start bullets with DIFFERENT verbs (track usage!)
   ✅ Mix technical, business, and collaborative focus
   ✅ Use conversational tone: "helped teams fix issues" NOT "facilitated cross-functional remediation"
   ✅ Include bullets WITHOUT metrics (1-2 per role)
   ✅ Use approximate numbers: "about 30%," "roughly 15 apps," "~50 vendors"
   ✅ Add context: "on 6-person team," "reporting to VP," "during Q2 2023"

5. PROGRESSION STRATEGY:
   
   EARLIEST ROLE (foundation):
   • Junior/entry-level title appropriate for timeframe
   • Foundational skills: learning, supporting, assisting
   • Scope: team-level, specific tasks, building basics
   • 2-3 bullets max
   • Example: "Security Analyst" → focus on ticket handling, basic assessments, learning tools
   
   MIDDLE ROLE(S) (growth):
   • Mid-level title showing advancement
   • Independent execution, moderate scope projects
   • Scope: project-level, some ownership, cross-team work
   • 3-4 bullets
   • Example: "GRC Specialist" → focus on program execution, vendor assessments, documentation
   
   MOST RECENT ROLE (readiness):
   • Senior/lead title suggesting readiness for target
   • Strategic work, program ownership, mentoring
   • Scope: program-level, stakeholder mgmt, process improvement
   • 4-5 bullets (most substantial role)
   • Example: "Senior GRC Consultant" → focus on client advisory, framework implementation, risk strategy

6. JD TRANSLATION FOR PROGRESSION:
   Step 1: Identify top 5-7 JD requirements
   Step 2: Map requirements to career arc:
   • EARLY role = 20% JD coverage (foundational versions of skills)
   • MIDDLE role(s) = 30% JD coverage (growing capability)
   • RECENT role = 50% JD coverage (readiness signals)
   
   Step 3: Translate JD language into natural synonyms:
   • JD: "vendor risk management" → Early: "supplier security checks" → Recent: "third-party risk evaluation programs"
   • JD: "audit preparation" → Early: "helped organize exam materials" → Recent: "coordinated regulatory examination readiness"
   • JD: "GRC tools" → Early: "learned ServiceNow basics" → Recent: "managed GRC platform operations"

7. KEEP COMPLETELY UNCHANGED:
   ✅ Company names (exact)
   ✅ Employment dates (exact)
   ✅ Locations (exact)
   ✅ Section structure
   ✅ Certifications, education

8. WHAT TO CHANGE:
   🔄 Job titles (to create logical progression)
   🔄 Bullet points (65-75% rewrite to show growth arc)
   🔄 Professional summary (show journey toward target)
   🔄 Core competencies (emphasize progression: foundational → advanced)
   🔄 Achievements (scale with career stage)

9. REALISTIC SCOPE BY TENURE + CAREER STAGE:
   EARLY CAREER:
   • 6 months = 2-3 bullets, support/learning focus, small wins
   • 1 year = 3 bullets, execution focus, team-level impact
   
   MID CAREER:
   • 1-2 years = 3-4 bullets, ownership focus, project-level impact
   • 2-3 years = 4 bullets, program focus, cross-team impact
   
   SENIOR:
   • 3+ years = 4-5 bullets, strategic focus, organizational impact
   
   RED FLAG: 1-year role claiming "enterprise transformation" or "led 50-person team"

10. PROFESSIONAL SUMMARY:
    • 3-4 sentences showing progression journey
    • Example: "GRC professional who started in operational security, grew through vendor risk programs at Wells Fargo, and now delivers healthcare compliance consulting. Experience spans banking regulations, third-party assessments, and audit coordination."
    • NO JD language copying

11. CORE COMPETENCIES:
    • Show skill breadth suggesting career growth
    • Lead with JD-relevant terms but use synonyms
    • 10-12 terms total
    • Example: If JD emphasizes "risk frameworks," list "NIST Implementation • ISO 27001 Alignment • Security Control Standards"

12. COVER LETTER (3 short paragraphs):
    Para 1: "I'm interested in [role] at [company]. My career progression from [early focus] to [recent focus] has prepared me for [what role needs]."
    Para 2: "What excites me about this opportunity is [genuine reason - challenge, mission, growth area]."
    Para 3: "I'd value the chance to discuss how my background could help. Thank you for your time."
    
    • Conversational, genuine tone
    • Use contractions
    • NO resume/JD repetition

13. VERIFICATION CHECKLIST:
    □ Titles show logical progression toward target?
    □ No 3+ word JD phrases copied?
    □ Forbidden phrases used <2x per role?
    □ Each role distinctly different (no repetition)?
    □ Scope matches tenure + career stage?
    □ Sounds human-written, not AI?
    □ Companies/dates unchanged?

OUTPUT FORMAT (VALID JSON ONLY):
{
  "optimizedResume": "full resume showing realistic career progression",
  "coverLetter": "3-paragraph genuine letter acknowledging growth journey",
  "feedback": "Summary: progression strategy used + how JD themes distributed across career arc"
}`,
        messages: [
          {
            role: 'user',
            content: `Target Role: ${roleTitle}

Job Description:
${jobDescription}

Current Resume (KEEP companies/dates; CREATE progression with new titles):
${currentResume}

TASK:
1. Identify top 5-7 JD requirements
2. Create logical title progression: Junior → Mid-level → Senior (leading to target)
3. Distribute JD themes: Early 20% → Middle 30% → Recent 50%
4. Translate JD concepts into natural progression language (see system examples)
5. Ensure scope matches both tenure AND career stage
6. Make it sound like a real human's career journey

Return ONLY valid JSON.`
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

    // Detect AI patterns
    const warnings = detectAIPatterns(parsedContent.optimizedResume);
    if (warnings.length > 0) {
      console.warn('🚨 AI LANGUAGE DETECTED:\n', warnings.join('\n'));
    }

    console.log('✅ NEW PROGRESSION generation complete!');
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

// ---------- ADJUSTMENT ENDPOINT ----------
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
7. NEVER use forbidden AI phrases: "leverage," "drive," "cross-functional collaboration," "proven track record," "passionate," "cutting-edge," "robust," "synergy," "impactful," "security-focused culture," "advocate for"

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
