import React, { useState, useEffect } from "react";
import {
  FileText,
  Briefcase,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  History,
  Sparkles,
  Eye,
} from "lucide-react";
import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

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
    jobDescription: "",
    currentResume: DEFAULT_RESUME,
    roleTitle: "",
    companyName: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isUsingDefaultResume, setIsUsingDefaultResume] = useState(true);
  const [scanHistory, setScanHistory] = useState([]);

  const API_URL = "/api";

  useEffect(() => {
    const savedHistory = localStorage.getItem("noninoScanHistory");
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveScanToHistory = (roleTitle, companyName) => {
    const newScan = {
      id: Date.now(),
      roleTitle,
      companyName,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };
    const updatedHistory = [newScan, ...scanHistory].slice(0, 10);
    setScanHistory(updatedHistory);
    localStorage.setItem("noninoScanHistory", JSON.stringify(updatedHistory));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsUsingDefaultResume(false);

    if (file.type === "text/plain") {
      const text = await file.text();
      setFormData((prev) => ({ ...prev, currentResume: text }));
    } else {
      alert("Please use .txt files or paste your resume text directly.");
    }
  };

  const handleResumeTextChange = (e) => {
    setFormData((prev) => ({ ...prev, currentResume: e.target.value }));
    setIsUsingDefaultResume(false);
  };

  const resetToDefaultResume = () => {
    setFormData((prev) => ({ ...prev, currentResume: DEFAULT_RESUME }));
    setIsUsingDefaultResume(true);
    setUploadedFileName("");
  };

  const generateOptimizedContent = async () => {
    if (
      !formData.jobDescription ||
      !formData.currentResume ||
      !formData.roleTitle ||
      !formData.companyName
    ) {
      setError(
        "Please fill in all required fields (Company Name, Role Title, Job Description, and Resume)."
      );
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: formData.jobDescription,
          currentResume: formData.currentResume,
          roleTitle: formData.roleTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const result = await response.json();
      setResults({
        optimizedResume: result.data.optimizedResume,
        coverLetter: result.data.coverLetter,
        feedback: result.data.feedback,
      });

      saveScanToHistory(formData.roleTitle, formData.companyName);
    } catch (err) {
      setError(err.message || "Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const convertTextToParagraphs = (text) => {
    const lines = text.split("\n");
    const paragraphs = [];
    let isFirstLine = true;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine === "") {
        paragraphs.push(new Paragraph({ text: "", spacing: { after: 100 } }));
        return;
      }

      if (isFirstLine && trimmedLine.length > 0) {
        isFirstLine = false;
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine,
                bold: true,
                size: 32,
                font: "Calibri",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          })
        );
        return;
      }

      if (index === 1) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine,
                size: 22,
                font: "Calibri",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          })
        );
        return;
      }

      if (
        trimmedLine === trimmedLine.toUpperCase() &&
        trimmedLine.length < 50 &&
        !trimmedLine.startsWith("-") &&
        !trimmedLine.includes("|")
      ) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine,
                bold: true,
                size: 26,
                font: "Calibri",
                color: "1E3A8A",
              }),
            ],
            spacing: { before: 200, after: 100 },
          })
        );
        return;
      }

      if (trimmedLine.includes("|") && !trimmedLine.startsWith("-")) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine,
                bold: true,
                size: 22,
                font: "Calibri",
              }),
            ],
            spacing: { before: 150, after: 50 },
          })
        );
        return;
      }

      if (trimmedLine.startsWith("-")) {
        const bulletText = trimmedLine.substring(1).trim();
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: bulletText,
                size: 22,
                font: "Calibri",
              }),
            ],
            bullet: { level: 0 },
            spacing: { after: 100 },
          })
        );
        return;
      }

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
              size: 22,
              font: "Calibri",
            }),
          ],
          spacing: { after: 100 },
        })
      );
    });

    return paragraphs;
  };

  const openInWord = async (content, documentType) => {
    try {
      if (!content || content.trim() === "") {
        alert("No content found to export.");
        return;
      }

      const firstLetter =
        formData.companyName?.trim()?.charAt(0)?.toUpperCase() || "X";
      const fileName =
        documentType === "resume"
          ? `King_${firstLetter}_Resume`
          : `King_${firstLetter}_CoverLetter`;

      const contentParagraphs = convertTextToParagraphs(content);

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 1080, bottom: 1080, left: 1008, right: 1008 },
              },
            },
            children: contentParagraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${fileName}.docx`);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error creating Word file:", error);
      alert("Failed to generate the Word document. Check console for details.");
    }
  };

  // ✅ Everything below (UI) stays exactly the same — no need to change it.
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      {/* UI content here (same as before) */}
    </div>
  );
}
