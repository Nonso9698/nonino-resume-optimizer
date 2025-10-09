import React, { useState, useEffect } from 'react';
import { FileText, Briefcase, Upload, Loader2, CheckCircle, AlertCircle, History, Sparkles, Eye, RefreshCw } from 'lucide-react';
import { Document, Paragraph, TextRun, Packer, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

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
  const [mode, setMode] = useState('optimizer');

  const API_URL = '/api';

  useEffect(() => {
    const savedHistory = localStorage.getItem('noninoScanHistory');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveScanToHistory = (roleTitle, companyName, mode) => {
    const newScan = {
      id: Date.now(),
      roleTitle,
      companyName,
      mode: mode === 'optimizer' ? 'Optimized' : 'New Resume',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };
    
    const updatedHistory = [newScan, ...scanHistory].slice(0, 10);
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
      const endpoint = mode === 'optimizer' ? '/generate' : '/generate-new';
      
      const response = await fetch(`${API_URL}${endpoint}`, {
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

      saveScanToHistory(formData.roleTitle, formData.companyName, mode);
    } catch (err) {
      setError(err.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const convertTextToParagraphs = (text) => {
    const lines = text.split('\n');
    const paragraphs = [];
    let isFirstLine = true;
    let inEducationSection = false;
    
    paragraphs.push(new Paragraph({ 
      text: "",
      spacing: { after: 0 }
    }));
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        paragraphs.push(new Paragraph({ 
          text: "",
          spacing: { after: 20 }
        }));
        return;
      }
      
      if (isFirstLine && trimmedLine.length > 0) {
        isFirstLine = false;
        paragraphs.push(new Paragraph({
          children: [new TextRun({ 
            text: trimmedLine,
            bold: true,
            size: 32,
            font: "Calibri"
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 20 }
        }));
        return;
      }
      
      if (index === 1) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ 
            text: trimmedLine,
            bold: true,
            size: 18,
            font: "Calibri"
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        }));
        return;
      }
      
      if (trimmedLine === trimmedLine.toUpperCase() && 
          trimmedLine.length < 50 && 
          !trimmedLine.startsWith('-') &&
          !trimmedLine.includes('|')) {
        
        inEducationSection = trimmedLine.includes('EDUCATION');
        
        paragraphs.push(new Paragraph({
          children: [new TextRun({ 
            text: trimmedLine,
            bold: true,
            size: 24,
            font: "Calibri",
            color: "1E3A8A"
          })],
          spacing: { before: 80, after: 40 }
        }));
        return;
      }
      
      if (inEducationSection && !trimmedLine.startsWith('-')) {
        if (trimmedLine.match(/^(●\s*)?(master|bachelor|associate|phd|diploma|doctor)/i)) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ 
              text: trimmedLine.replace(/^●\s*/, ''),
              size: 20,
              font: "Calibri"
            })],
            bullet: {
              level: 0
            },
            spacing: { after: 30 }
          }));
          return;
        }
        
        if (trimmedLine.includes('|')) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ 
              text: trimmedLine,
              size: 20,
              font: "Calibri"
            })],
            spacing: { before: 50, after: 15 }
          }));
          return;
        }
      }
      
      if (trimmedLine.includes('|') && !trimmedLine.startsWith('-')) {
        inEducationSection = false;
        paragraphs.push(new Paragraph({
          children: [new TextRun({ 
            text: trimmedLine,
            bold: true,
            size: 18,
            font: "Calibri"
          })],
          spacing: { after: 30 }
        }));
        return;
      }
      
      if (!inEducationSection && 
          !trimmedLine.startsWith('-') && 
          trimmedLine !== trimmedLine.toUpperCase() &&
          !trimmedLine.includes('|') &&
          index > 2 &&
          lines[index + 1] && lines[index + 1].includes('|')) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ 
            text: trimmedLine,
            bold: true,
            size: 22,
            font: "Calibri"
          })],
          spacing: { before: 60, after: 15 }
        }));
        return;
      }
      
      if (trimmedLine.startsWith('-')) {
        inEducationSection = false;
        const bulletText = trimmedLine.substring(1).trim();
        paragraphs.push(new Paragraph({
          children: [new TextRun({ 
            text: bulletText,
            size: 20,
            font: "Calibri"
          })],
          bullet: {
            level: 0
          },
          spacing: { after: 30 }
        }));
        return;
      }
      
      paragraphs.push(new Paragraph({
        children: [new TextRun({ 
          text: trimmedLine,
          size: 20,
          font: "Calibri"
        })],
        spacing: { after: 30 }
      }));
    });
    
    return paragraphs;
  };

  const openInWord = async (content, documentType) => {
    try {
      const firstLetter = formData.companyName.trim().charAt(0).toUpperCase();
      const fileName = documentType === 'resume' 
        ? `King_${firstLetter}_Resume`
        : `King_${firstLetter}_CoverLetter`;

      const contentParagraphs = convertTextToParagraphs(content);

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1080,
                bottom: 1080,
                left: 1008,
                right: 1008
              }
            }
          },
          children: contentParagraphs,
        }],
        styles: {
          default: {
            document: {
              run: {
                font: "Calibri",
                size: 20
              },
              paragraph: {
                spacing: {
                  line: 240,
                  after: 30
                }
              }
            }
          }
        }
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${fileName}.docx`);
    } catch (error) {
      console.error('Error creating Word document:', error);
      alert('Error creating Word document: ' + error.message);
    }
  };

  const downloadAsPDF = async (content, documentType) => {
    try {
      const firstLetter = formData.companyName.trim().charAt(0).toUpperCase();
      const fileName = documentType === 'resume' 
        ? `King_${firstLetter}_Resume.pdf`
        : `King_${firstLetter}_CoverLetter.pdf`;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter'
      });

      doc.setFont('helvetica');

      const lines = content.split('\n');
      let yPosition = 72;
      const leftMargin = 72;
      const rightMargin = 72;
      const pageWidth = 612;
      const pageHeight = 792;
      const contentWidth = pageWidth - leftMargin - rightMargin;
      let isFirstLine = true;
      let inEducationSection = false;

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine === '') {
          yPosition += 6;
          return;
        }

        if (yPosition > pageHeight - 72) {
          doc.addPage();
          yPosition = 72;
        }

        if (isFirstLine && trimmedLine.length > 0) {
          isFirstLine = false;
          yPosition += 12;
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          const textWidth = doc.getTextWidth(trimmedLine);
          const xPosition = (pageWidth - textWidth) / 2;
          doc.text(trimmedLine, xPosition, yPosition);
          yPosition += 8;
          return;
        }

        if (index === 1) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          const textWidth = doc.getTextWidth(trimmedLine);
          const xPosition = (pageWidth - textWidth) / 2;
          doc.text(trimmedLine, xPosition, yPosition);
          yPosition += 24;
          return;
        }

        if (trimmedLine === trimmedLine.toUpperCase() && 
            trimmedLine.length < 50 && 
            !trimmedLine.startsWith('-') &&
            !trimmedLine.includes('|')) {
          
          inEducationSection = trimmedLine.includes('EDUCATION');
          
          yPosition += 12;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 58, 138);
          doc.text(trimmedLine, leftMargin, yPosition);
          doc.setTextColor(0, 0, 0);
          yPosition += 16;
          return;
        }

        if (inEducationSection && !trimmedLine.startsWith('-')) {
          if (trimmedLine.match(/^(●\s*)?(master|bachelor|associate|phd|diploma|doctor)/i)) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const bulletText = trimmedLine.replace(/^●\s*/, '');
            doc.text('•', leftMargin, yPosition);
            const wrappedText = doc.splitTextToSize(bulletText, contentWidth - 20);
            doc.text(wrappedText, leftMargin + 15, yPosition);
            yPosition += wrappedText.length * 12 + 4;
            return;
          }

          if (trimmedLine.includes('|')) {
            yPosition += 8;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const wrappedText = doc.splitTextToSize(trimmedLine, contentWidth);
            doc.text(wrappedText, leftMargin, yPosition);
            yPosition += wrappedText.length * 12 + 4;
            return;
          }
        }

        if (trimmedLine.includes('|') && !trimmedLine.startsWith('-')) {
          inEducationSection = false;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          const wrappedText = doc.splitTextToSize(trimmedLine, contentWidth);
          doc.text(wrappedText, leftMargin, yPosition);
          yPosition += wrappedText.length * 11 + 4;
          return;
        }

        if (!inEducationSection && 
            !trimmedLine.startsWith('-') && 
            trimmedLine !== trimmedLine.toUpperCase() &&
            !trimmedLine.includes('|') &&
            index > 2 &&
            lines[index + 1] && lines[index + 1].includes('|')) {
          yPosition += 10;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(trimmedLine, leftMargin, yPosition);
          yPosition += 6;
          return;
        }

        if (trimmedLine.startsWith('-')) {
          inEducationSection = false;
          const bulletText = trimmedLine.substring(1).trim();
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('•', leftMargin, yPosition);
          const wrappedText = doc.splitTextToSize(bulletText, contentWidth - 20);
          doc.text(wrappedText, leftMargin + 15, yPosition);
          yPosition += wrappedText.length * 12 + 4;
          return;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const wrappedText = doc.splitTextToSize(trimmedLine, contentWidth);
        doc.text(wrappedText, leftMargin, yPosition);
        yPosition += wrappedText.length * 12 + 4;
      });

      doc.save(fileName);
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Error creating PDF: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      <div className="bg-blue-950/50 backdrop-blur-sm border-b border-blue-700/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
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
          
          <div className="flex items-center justify-center gap-2 bg-blue-900/50 rounded-xl p-1">
            <button
              onClick={() => {
                setMode('optimizer');
                setResults(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                mode === 'optimizer'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Resume Optimizer
            </button>
            <button
              onClick={() => {
                setMode('new-resume');
                setResults(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                mode === 'new-resume'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              New Resume
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-gray-800">Scan History</h2>
              </div>
              
              {scanHistory.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No scans yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {scanHistory.map((scan) => (
                    <div 
                      key={scan.id} 
                      className="bg-blue-50 rounded-lg p-2.5 border border-blue-100 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          scan.mode === 'Optimized' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'
                        }`}>
                          {scan.mode}
                        </span>
                      </div>
                      <div className="font-semibold text-xs text-gray-800 mb-0.5 truncate">
                        {scan.roleTitle}
                      </div>
                      <div className="text-[10px] text-gray-600 mb-0.5 truncate">
                        {scan.companyName}
                      </div>
                      <div className="text-[9px] text-gray-400">
                        {scan.date} • {scan.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className={`mb-6 rounded-2xl p-4 border-2 ${
              mode === 'optimizer'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <h3 className={`font-bold text-sm mb-1 ${
                mode === 'optimizer' ? 'text-blue-800' : 'text-green-800'
              }`}>
                {mode === 'optimizer' ? '📝 Resume Optimizer Mode' : '🆕 New Resume Mode'}
              </h3>
              <p className={`text-xs ${
                mode === 'optimizer' ? 'text-blue-700' : 'text-green-700'
              }`}>
                {mode === 'optimizer'
                  ? 'Keeps your exact job titles, companies, and dates. Only optimizes bullet points to match the job description.'
                  : 'Keeps companies and dates the same, but creates a logical career progression with new job titles leading to your target role.'}
              </p>
            </div>

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
                          Target Role <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Software Engineer, Data Analyst"
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
                    className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02] ${
                      mode === 'optimizer'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {mode === 'optimizer' ? 'Optimizing Your Resume...' : 'Creating New Resume...'}
                      </>
                    ) : (
                      <>
                        {mode === 'optimizer' ? <Sparkles className="w-5 h-5 mr-2" /> : <RefreshCw className="w-5 h-5 mr-2" />}
                        {mode === 'optimizer' ? 'Generate Optimized Resume & Cover Letter' : 'Generate New Resume & Cover Letter'}
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
                      Generation Complete!
                    </h3>
                    <p className="text-sm text-green-700">
                      Your {mode === 'optimizer' ? 'optimized' : 'new'} resume and cover letter are ready to view.
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
                      {mode === 'optimizer' ? 'Optimized Resume' : 'New Resume'}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadAsPDF(results.optimizedResume, 'resume')}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/>
                        </svg>
                        PDF
                      </button>
                      <button
                        onClick={() => openInWord(results.optimizedResume, 'resume')}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Word
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
                        onClick={() => downloadAsPDF(results.coverLetter, 'coverletter')}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/>
                        </svg>
                        PDF
                      </button>
                      <button
                        onClick={() => openInWord(results.coverLetter, 'coverletter')}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Word
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
                  Start New Generation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
  
