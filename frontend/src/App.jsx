export default function ResumeOptimizerApp() {
  const [formData, setFormData] = useState({
    jobDescription: '',
    currentResume: DEFAULT_RESUME,
    roleTitle: '',
    companyName: '',
    dateApplied: new Date().toISOString().split('T')[0],
    resumeName: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUsingDefaultResume, setIsUsingDefaultResume] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'import React, { useState } from 'react';
import { FileText, Briefcase, Upload, Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react';

const DEFAULT_RESUME = `KING N. IHE., CISA
Charlotte, NC | 704-387-0104 | Nonso.King.Ihe@gmail.com | linkedin.com/in/king-n-i-ab994133b

PROFESSIONAL SUMMARY
CISA-certified GRC professional who reduced regulatory audit preparation time by 50% and managed risk assessments for 500+ vendor relationships across Wells Fargo and Bank of America. Expertise in ServiceNow GRC automation, SOX compliance, and third-party risk management with proven ability to achieve zero critical audit findings through systematic control testing and remediation tracking. Combines technical risk assessment skills with business process optimization to deliver measurable compliance cost reductions and operational efficiency gains.

CORE COMPETENCIES
Third-Party Risk Management (TPRM) • Vendor Due Diligence • Enterprise Risk Assessment • Operational Risk Analysis • SOX IT General Controls • PCI DSS Assessment • NIST Cybersecurity Framework • ISO 27001 Implementation • Internal Controls Testing • SOC 2 Type II Support • Control Design Evaluation • Remediation Tracking • ServiceNow GRC Administration • Splunk Security Analytics • Nessus Vulnerability Assessment • RSA Archer

PROFESSIONAL EXPERIENCE

GRC Consultant
Octasquare Inc | Charlotte, NC (Remote) | June 2024 – Present

• Conduct comprehensive HITRUST risk assessments across 6 healthcare client environments, identifying access control vulnerabilities and data encryption gaps while developing prioritized remediation roadmaps that reduced vulnerability exposure by 25%
• Led standardization of third-party vendor risk evaluation processes for 50+ critical suppliers, developing risk scoring methodology that decreased assessment cycle time from 45 to 30 days
• Execute PCI DSS compliance gap analyses for payment processing environments, documenting control deficiencies and collaborating with IT teams and business owners on remediation activities with 85% closure rate within regulatory timelines
• Built real-time risk monitoring dashboards in Splunk, eliminating 35% of manual reporting tasks and providing executive visibility into compliance metrics across client portfolios

Information Security Compliance Specialist
Bank of America | Charlotte, NC | March 2023 – June 2024

• Managed ServiceNow GRC platform operations within 8-person risk team, serving 200+ users across audit and risk functions while deploying automated workflows that reduced manual documentation by 30%
• Coordinated OCC regulatory examination preparation across 15 business units under senior manager oversight, managing control testing documentation and artifact collection that resulted in zero critical findings
• Monitored SOX IT General Controls program covering 250+ quarterly control tests within $2.4 trillion asset bank, maintaining 95% compliance with Sarbanes-Oxley and BSA/AML regulatory requirements
• Coordinated meetings with audit, risk, and business teams, improving examination response time by 40% and standardizing evidence collection processes across the enterprise

Internal Audit and Compliance Specialist
Wells Fargo | Charlotte, NC | December 2019 – August 2023

• Managed third-party vendor risk assessment program covering 500+ relationships within 12-person compliance team at $1.9 trillion asset institution, developing automated risk scoring that reduced initial evaluation time from 8 to 5 business days
• Deployed ISO 27001-aligned security control framework across technology operations, training 150+ staff and achieving 90% adoption rate within 18 months under director supervision
• Performed quarterly IT General Controls testing for 12 critical applications, identifying and tracking remediation of control deficiencies with business process owners and achieving 88% resolution rate
• Contributed to SOC 2 Type II audit processes through detailed control documentation and testing evidence, maintaining clean audit opinions across 8 business areas

CERTIFICATIONS
• Certified Information Systems Auditor (CISA)
• CompTIA Security+ (SY0-701)
• AWS Certified Solutions Architect – Associate (SAA-C03)
• Microsoft Certified: Azure Fundamentals (AZ-900)
• Google Project Management Professional Certificate
• Certified in Cybersecurity

EDUCATION
• Master of Science, Information Technology Management
Western Governors University | Salt Lake City, UT | 2020-2021
• Bachelor of Science, Real Estate Management
Abia State University | Uturu, | 2012

KEY ACHIEVEMENTS
• Reduced vendor risk assessment cycle time by 33% through automated scoring implementation
• Decreased regulatory examination preparation time by 40% via standardized documentation processes
• Eliminated 30-35% of manual reporting tasks through workflow automation and dashboard development
• Maintained 95% SOX control testing completion rate across 250+ quarterly assessments
• Achieved 85-88% deficiency remediation closure rate within established regulatory timelines
• Successfully supported zero critical findings during federal OCC examination
• Managed risk assessment operations for 500+ third-party vendor relationships
• Led security control framework adoption achieving 90% organizational implementation rate
• Supported clean SOC 2 Type II audit opinions across multiple business processes

TECHNICAL SKILLS
ServiceNow GRC (Administration & Workflow Design) • RSA Archer • AuditBoard • Splunk (Dashboard Creation & Analytics) • Nessus Professional • Qualys VMDR • AWS Security Services (IAM, CloudTrail, GuardDuty) • Microsoft Azure Security Center • Advanced Excel (Pivot Tables, Macros, Statistical Analysis) • SQL Database Queries • Power BI`;

export default function ResumeOptimizerApp() {
  const [formData, setFormData] = useState({
    jobDescription: '',
    currentResume: DEFAULT_RESUME,
    roleTitle: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUsingDefaultResume, setIsUsingDefaultResume] = useState(true);

  // Backend API URL - change this when deploying
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsUsingDefaultResume(false);
    
    if (file.type === 'text/plain') {
      const text = await file.text();
      setFormData(prev => ({ ...prev, currentResume: text }));
    } else {
      alert('For this demo, please use .txt files or paste your resume text directly. PDF/DOCX parsing requires backend setup.');
    }
  };

  const handleResumeTextChange = (e) => {
    setFormData(prev => ({ ...prev, currentResume: e.target.value }));
    setIsUsingDefaultResume(false);
  };

  const resetToDefaultResume = () => {
    setFormData(prev => ({ ...prev, currentResume: DEFAULT_RESUME }));
    setIsUsingDefaultResume(true);
    setUploadedFileName('');
  };

  const generateOptimizedContent = async () => {
    if (!formData.jobDescription || !formData.currentResume || !formData.roleTitle || !formData.companyName) {
      setError('Please fill in all required fields (Company Name, Role Title, Job Description, and Resume).');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Call our secure backend
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobDescription: formData.jobDescription,
          currentResume: formData.currentResume,
          roleTitle: formData.roleTitle
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const result = await response.json();

      setResults({
        optimizedResume: result.data.optimizedResume,
        coverLetter: result.data.coverLetter,
        feedback: result.data.feedback
      });
    } catch (err) {
      setError(err.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAsFile = (content, filename, format = 'docx') => {
    // Add tracking info at the top of the file
    const trackingInfo = `=================================
TRACKING INFORMATION
=================================
Company: ${formData.companyName || 'N/A'}
Role: ${formData.roleTitle}
Date Applied: ${formData.dateApplied}
Resume Name: ${formData.resumeName || 'King_Ihe_Resume_' + formData.companyName.replace(/\s+/g, '_')}
=================================

`;
    const contentWithTracking = trackingInfo + content;
    
    // Auto-generate filename with tracking info
    const safeCompanyName = formData.companyName.replace(/[^a-z0-9]/gi, '_');
    const safeRoleName = formData.roleTitle.replace(/[^a-z0-9]/gi, '_');
    const baseFilename = filename.includes('resume') 
      ? `${safeCompanyName}_${safeRoleName}_Resume_${formData.dateApplied}`
      : `${safeCompanyName}_${safeRoleName}_CoverLetter_${formData.dateApplied}`;
    
    if (format === 'pdf') {
      // For PDF, we'll create a simple HTML and use browser print
      const printWindow = window.open('', '_blank');
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${baseFilename}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              line-height: 1.6;
              color: #333;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: Arial, sans-serif;
              font-size: 11pt;
            }
            .tracking-info {
              background: #f0f0f0;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            @media print {
              body { margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <pre>${contentWithTracking}</pre>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 100);
            }
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else if (format === 'docx') {
      // Create basic DOCX structure (simple XML format)
      const docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">${contentWithTracking.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '</w:t></w:r></w:p><w:p><w:r><w:t xml:space="preserve">')}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;
      
      const blob = new Blob([docxContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseFilename}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Briefcase className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            AI Resume & Cover Letter Generator
          </h1>
          <p className="text-slate-600">
            Optimize your application materials for any job in seconds
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 flex items-start shadow-lg">
            <div className="bg-red-100 p-2 rounded-lg mr-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 mb-1">Oops! Something went wrong</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Input Form */}
        {!results && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="space-y-6">
              {/* Role Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Role Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cybersecurity Consultant, Senior GRC Analyst"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, roleTitle: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Paste the full job description here..."
                  value={formData.jobDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                  rows={8}
                  className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition resize-none shadow-sm"
                />
              </div>

              {/* Current Resume */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Current Resume <span className="text-red-500">*</span>
                  </label>
                  {!isUsingDefaultResume && (
                    <button
                      onClick={resetToDefaultResume}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Reset to Default Resume
                    </button>
                  )}
                </div>
                {isUsingDefaultResume && (
                  <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      ✓ Using default resume (King N. Ihe). Upload a file or edit the text below to use a different resume.
                    </p>
                  </div>
                )}
                <div className="mb-3">
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 transition">
                    <Upload className="w-5 h-5 text-slate-400 mr-2" />
                    <span className="text-sm text-slate-600">
                      {uploadedFileName || 'Upload .txt file (or edit text below)'}
                    </span>
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  placeholder="Or paste your current resume text here..."
                  value={formData.currentResume}
                  onChange={handleResumeTextChange}
                  rows={10}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateOptimizedContent}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    <span className="text-lg">Generating Your Optimized Materials...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-6 h-6 mr-3" />
                    <span className="text-lg">Generate Optimized Resume & Cover Letter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 mb-1">
                  Generation Complete!
                </h3>
                <p className="text-sm text-green-700">
                  Your optimized resume and cover letter are ready for download.
                </p>
              </div>
            </div>

            {/* Recruiter Feedback */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center">
                <CheckCircle className="w-6 h-6 text-blue-600 mr-2" />
                Recruiter Feedback Summary
              </h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {results.feedback}
              </p>
            </div>

            {/* Optimized Resume */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <FileText className="w-6 h-6 text-blue-600 mr-2" />
                  Optimized Resume
                </h2>
                <button
                  onClick={() => downloadAsFile(results.optimizedResume, 'optimized-resume.txt')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download TXT
                </button>
              </div>
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                  {results.optimizedResume}
                </pre>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <FileText className="w-6 h-6 text-blue-600 mr-2" />
                  Customized Cover Letter
                </h2>
                <button
                  onClick={() => downloadAsFile(results.coverLetter, 'cover-letter.txt')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download TXT
                </button>
              </div>
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                  {results.coverLetter}
                </pre>
              </div>
            </div>

            {/* Start Over Button */}
            <button
              onClick={() => {
                setResults(null);
                setError(null);
                setFormData(prev => ({ 
                  ...prev,
                  jobDescription: '', 
                  currentResume: DEFAULT_RESUME, 
                  roleTitle: '',
                  companyName: '',
                  dateApplied: new Date().toISOString().split('T')[0],
                  resumeName: ''
                }));
                setUploadedFileName('');
                setIsUsingDefaultResume(true);
              }}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Start Over with New Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
