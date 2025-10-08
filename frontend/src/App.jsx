import React, { useState, useEffect } from 'react';
import { FileText, Briefcase, Upload, Loader2, Download, CheckCircle, AlertCircle, History, Sparkles } from 'lucide-react';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import { saveAs } from 'file-saver';

const DEFAULT_RESUME = `KING N. IHE., CISA
Charlotte, NC | 704-387-0104 | Nonso.King.Ihe@gmail.com | linkedin.com/in/king-n-i-ab994133b

PROFESSIONAL SUMMARY
CISA-certified GRC professional who reduced regulatory audit preparation time by 50% and managed risk assessments for 500+ vendor relationships across Wells Fargo and Bank of America. Expertise in ServiceNow GRC automation, SOX compliance, and third-party risk management with proven ability to achieve zero critical audit findings through systematic control testing and remediation tracking. Combines technical risk assessment skills with business process optimization to deliver measurable compliance cost reductions and operational efficiency gains.

CORE COMPETENCIES
Third-Party Risk Management (TPRM) • Vendor Due Diligence • Enterprise Risk Assessment • Operational Risk Analysis • SOX IT General Controls • PCI DSS Assessment • NIST Cybersecurity Framework • ISO 27001 Implementation • Internal Controls Testing • SOC 2 Type II Support • Control Design Evaluation • Remediation Tracking • ServiceNow GRC Administration • Splunk Security Analytics • Nessus Vulnerability Assessment • RSA Archer

PROFESSIONAL EXPERIENCE

GRC Consultant
Octasquare Inc | Charlotte, NC (Remote) | June 2024 – Present

- Conduct comprehensive HITRUST risk assessments across 6 healthcare client environments, identifying access control vulnerabilities and data encryption gaps while developing prioritized remediation roadmaps that reduced vulnerability exposure by 25%
- Led standardization of third-party vendor risk evaluation processes for 50+ critical suppliers, developing risk scoring methodology that decreased assessment cycle time from 45 to 30 days
- Execute PCI DSS compliance gap analyses for payment processing environments, documenting control deficiencies and collaborating with IT teams and business owners on remediation activities with 85% closure rate within regulatory timelines
- Built real-time risk monitoring dashboards in Splunk, eliminating 35% of manual reporting tasks and providing executive visibility into compliance metrics across client portfolios

Information Security Compliance Specialist
Bank of America | Charlotte, NC | March 2023 – June 2024

- Managed ServiceNow GRC platform operations within 8-person risk team, serving 200+ users across audit and risk functions while deploying automated workflows that reduced manual documentation by 30%
- Coordinated OCC regulatory examination preparation across 15 business units under senior manager oversight, managing control testing documentation and artifact collection that resulted in zero critical findings
- Monitored SOX IT General Controls program covering 250+ quarterly control tests within $2.4 trillion asset bank, maintaining 95% compliance with Sarbanes-Oxley and BSA/AML regulatory requirements
- Coordinated meetings with audit, risk, and business teams, improving examination response time by 40% and standardizing evidence collection processes across the enterprise

Internal Audit and Compliance Specialist
Wells Fargo | Charlotte, NC | December 2019 – August 2023

- Managed third-party vendor risk assessment program covering 500+ relationships within 12-person compliance team at $1.9 trillion asset institution, developing automated risk scoring that reduced initial evaluation time from 8 to 5 business days
- Deployed ISO 27001-aligned security control framework across technology operations, training 150+ staff and achieving 90% adoption rate within 18 months under director supervision
- Performed quarterly IT General Controls testing for 12 critical applications, identifying and tracking remediation of control deficiencies with business process owners and achieving 88% resolution rate
- Contributed to SOC 2 Type II audit processes through detailed control documentation and testing evidence, maintaining clean audit opinions across 8 business areas

CERTIFICATIONS
- Certified Information Systems Auditor (CISA)
- CompTIA Security+ (SY0-701)
- AWS Certified Solutions Architect – Associate (SAA-C03)
- Microsoft Certified: Azure Fundamentals (AZ-900)
- Google Project Management Professional Certificate
- Certified in Cybersecurity

EDUCATION
- Master of Science, Information Technology Management
Western Governors University | Salt Lake City, UT | 2020-2021
- Bachelor of Science, Real Estate Management
Abia State University | Uturu, | 2012

KEY ACHIEVEMENTS
- Reduced vendor risk assessment cycle time by 33% through automated scoring implementation
- Decreased regulatory examination preparation time by 40% via standardized documentation processes
- Eliminated 30-35% of manual reporting tasks through workflow automation and dashboard development
- Maintained 95% SOX control testing completion rate across 250+ quarterly assessments
- Achieved 85-88% deficiency remediation closure rate within established regulatory timelines
- Successfully supported zero critical findings during federal OCC examination
- Managed risk assessment operations for 500+ third-party vendor relationships
- Led security control framework adoption achieving 90% organizational implementation rate
- Supported clean SOC 2 Type II audit opinions across multiple business processes

TECHNICAL SKILLS
ServiceNow GRC (Administration & Workflow Design) • RSA Archer • AuditBoard • Splunk (Dashboard Creation & Analytics) • Nessus Professional • Qualys VMDR • AWS Security Services (IAM, CloudTrail, GuardDuty) • Microsoft Azure Security Center • Advanced Excel (Pivot Tables, Macros, Statistical Analysis) • SQL Database Queries • Power BI`;

export default function NoninoResumeOptimizer() {
  const [formData, setFormData] = useState({
    jobDescription: '',
    currentResume: DEFAULT_RESUME,
    roleTitle: '',
    companyName: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUsingDefaultResume, setIsUsingDefaultResume] = useState(true);
  const [scanHistory, setScanHistory] = useState([]);

  const API_URL = '/api';

  // Load scan history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('noninoScanHistory');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save scan to history
  const saveScanToHistory = (roleTitle, companyName) => {
    const newScan = {
      id: Date.now(),
      roleTitle,
      companyName,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };
    
    const updatedHistory = [newScan, ...scanHistory].slice(0, 20); // Keep last 20 scans
    setScanHistory(updatedHistory);
    localStorage.setItem('noninoScanHistory', JSON.stringify(updatedHistory));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsUsingDefaultResume(false);
    
    if (file.type === 'text/plain') {
      const text = await file.text();
      setFormData(prev => ({ ...prev, currentResume: text }));
    } else {
      alert('Please use .txt files or paste your resume text directly.');
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
      const response = await fetch(`${API_URL}/generate`, {
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

      // Save to scan history
      saveScanToHistory(formData.roleTitle, formData.companyName);
    } catch (err) {
      setError(err.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const convertTextToParagraphs = (text) => {
    return text.split('\n').map(line => {
      if (line.trim() === '') {
        return new Paragraph({ text: "" });
      }
      return new Paragraph({
        children: [new TextRun(line)],
        spacing: { after: 100 },
      });
    });
  };

  const downloadAsDocx = async (content, filename) => {
    const firstLetter = formData.companyName.charAt(0).toUpperCase();
    const safeRoleName = formData.roleTitle.replace(/[^a-z0-9]/gi, '_');
    const baseFilename = filename.includes('resume') 
      ? `King_${firstLetter}`
      : `King_${firstLetter}_CoverLetter`;

    const contentParagraphs = convertTextToParagraphs(content);

    const doc = new Document({
      sections: [{
        properties: {},
        children: contentParagraphs,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${baseFilename}.docx`);
  };

  const downloadAsPdf = (content) => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Document</title>
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
          @media print {
            body { margin: 20mm; }
          }
        </style>
      </head>
      <body>
        <pre>${content}</pre>
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      {/* Header */}
      <div className="bg-blue-950/50 backdrop-blur-sm border-b border-blue-700/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Nonino Resume Optimizer</h1>
              <p className="text-xs text-blue-300">AI-Powered Career Enhancement</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Scan History Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">Scan History</h2>
              </div>
              
              {scanHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No scans yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {scanHistory.map((scan) => (
                    <div 
                      key={scan.id} 
                      className="bg-blue-50 rounded-lg p-3 border border-blue-100 hover:border-blue-300 transition-colors"
                    >
                      <div className="font-semibold text-sm text-gray-800 mb-1 truncate">
                        {scan.roleTitle}
                      </div>
                      <div className="text-xs text-gray-600 mb-1 truncate">
                        {scan.companyName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {scan.date} • {scan.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start shadow-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {!results && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
                      Application Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Google, Microsoft"
                          value={formData.companyName}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Role Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Senior GRC Analyst"
                          value={formData.roleTitle}
                          onChange={(e) => setFormData(prev => ({ ...prev, roleTitle: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Paste the full job description here..."
                      value={formData.jobDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                      rows={8}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
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
                      <div className="mb-3 px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <p className="text-xs text-blue-700">
                          ✓ Using default resume (King N. Ihe). Upload a file or edit the text below to use a different resume.
                        </p>
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="flex items-center justify-center w-full px-4 py-4 border-3 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                        <Upload className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 font-medium">
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none font-mono text-sm"
                    />
                  </div>

                  <button
                    onClick={generateOptimizedContent}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02]"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Optimizing Your Resume...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Optimized Resume & Cover Letter
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {results && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4 flex items-start shadow-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-green-800 mb-1">
                      Optimization Complete!
                    </h3>
                    <p className="text-sm text-green-700">
                      Your optimized resume and cover letter are ready for download.
                    </p>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <CheckCircle className="w-6 h-6 text-blue-600 mr-2" />
                    Expert Feedback
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {results.feedback}
                  </p>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <FileText className="w-6 h-6 text-blue-600 mr-2" />
                      Optimized Resume
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadAsDocx(results.optimizedResume, 'optimized-resume')}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        DOCX
                      </button>
                      <button
                        onClick={() => downloadAsPdf(results.optimizedResume)}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                      {results.optimizedResume}
                    </pre>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <FileText className="w-6 h-6 text-blue-600 mr-2" />
                      Customized Cover Letter
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadAsDocx(results.coverLetter, 'cover-letter')}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        DOCX
                      </button>
                      <button
                        onClick={() => downloadAsPdf(results.coverLetter)}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                      {results.coverLetter}
                    </pre>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setResults(null);
                    setError(null);
                    setFormData(prev => ({ 
                      ...prev,
                      jobDescription: '', 
                      currentResume: DEFAULT_RESUME, 
                      roleTitle: '',
                      companyName: ''
                    }));
                    setUploadedFileName('');
                    setIsUsingDefaultResume(true);
                  }}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Start New Optimization
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-blue-950/50 backdrop-blur-sm border-t border-blue-700/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-blue-300 text-sm">
            © 2025 Nonino Resume Optimizer. Powered by AI Technology.
          </p>
        </div>
      </div>
    </div>
  );
}
