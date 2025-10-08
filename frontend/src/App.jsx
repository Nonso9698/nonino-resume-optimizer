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
} from "lucide-react";
import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

// Default resume text
const DEFAULT_RESUME = `KING N. IHE., CISA
Charlotte, NC | 704-387-0104 | Nonso.King.Ihe@gmail.com | linkedin.com/in/king-n-i-ab994133b

PROFESSIONAL SUMMARY
CISA-certified GRC professional who reduced regulatory audit preparation time by 50% and managed risk assessments for 500+ vendor relationships across Wells Fargo and Bank of America. Expertise in ServiceNow GRC automation, SOX compliance, and third-party risk management with proven ability to achieve zero critical audit findings through systematic control testing and remediation tracking.

CORE COMPETENCIES
Third-Party Risk Management (TPRM) • Vendor Due Diligence • Enterprise Risk Assessment • Operational Risk Analysis • SOX IT General Controls • PCI DSS Assessment • NIST Cybersecurity Framework • ISO 27001 Implementation • Internal Controls Testing • SOC 2 Type II Support • Control Design Evaluation • Remediation Tracking • ServiceNow GRC Administration • Splunk Security Analytics • Nessus Vulnerability Assessment • RSA Archer

PROFESSIONAL EXPERIENCE
GRC Consultant
Octasquare Inc | Charlotte, NC (Remote) | June 2024 – Present

- Conducted HITRUST risk assessments across 6 healthcare client environments
- Led standardization of vendor risk evaluation processes for 50+ critical suppliers
- Built real-time risk dashboards in Splunk, cutting 35% manual reporting tasks

Information Security Compliance Specialist
Bank of America | Charlotte, NC | March 2023 – June 2024

- Managed ServiceNow GRC platform operations within 8-person risk team
- Coordinated OCC regulatory exam preparation across 15 business units
- Maintained 95% compliance with SOX control testing

Internal Audit and Compliance Specialist
Wells Fargo | Charlotte, NC | December 2019 – August 2023

- Managed vendor risk program for 500+ suppliers
- Deployed ISO 27001-aligned security control framework
- Supported clean SOC 2 Type II audit outcomes

CERTIFICATIONS
CISA | Security+ | AWS Certified Solutions Architect | Azure Fundamentals | Google Project Management Certificate

EDUCATION
Master of Science, Information Technology Management – Western Governors University
Bachelor of Science, Real Estate Management – Abia State University
`;

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
    if (savedHistory) setScanHistory(JSON.parse(savedHistory));
  }, []);

  const saveScanToHistory = (roleTitle, companyName) => {
    const newScan = {
      id: Date.now(),
      roleTitle,
      companyName,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };
    const updated = [newScan, ...scanHistory].slice(0, 10);
    setScanHistory(updated);
    localStorage.setItem("noninoScanHistory", JSON.stringify(updated));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setIsUsingDefaultResume(false);
    const text = await file.text();
    setFormData((prev) => ({ ...prev, currentResume: text }));
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
      setError("Please fill all required fields.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: formData.jobDescription,
          currentResume: formData.currentResume,
          roleTitle: formData.roleTitle,
        }),
      });

      if (!response.ok)
        throw new Error(`Request failed: ${response.status}`);

      const result = await response.json();
      setResults({
        optimizedResume: result.data.optimizedResume,
        coverLetter: result.data.coverLetter,
        feedback: result.data.feedback,
      });
      saveScanToHistory(formData.roleTitle, formData.companyName);
    } catch (err) {
      setError(err.message || "Failed to generate content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const convertTextToParagraphs = (text) => {
    const lines = text.split("\n");
    return lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed)
        return new Paragraph({ text: "", spacing: { after: 100 } });

      // Heading (ALL CAPS)
      if (
        trimmed === trimmed.toUpperCase() &&
        trimmed.length < 60 &&
        !trimmed.startsWith("-")
      ) {
        return new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              color: "1E3A8A",
              size: 26,
              font: "Calibri",
            }),
          ],
          spacing: { before: 200, after: 100 },
        });
      }

      // Bullet points
      if (trimmed.startsWith("-")) {
        return new Paragraph({
          children: [
            new TextRun({
              text: trimmed.substring(1).trim(),
              size: 22,
              font: "Calibri",
            }),
          ],
          bullet: { level: 0 },
          spacing: { after: 100 },
        });
      }

      // Normal text
      return new Paragraph({
        children: [new TextRun({ text: trimmed, size: 22, font: "Calibri" })],
        spacing: { after: 100 },
      });
    });
  };

  const openInWord = async (content, documentType) => {
    try {
      if (!content || content.trim() === "") {
        alert("No content to export.");
        return;
      }
      const firstLetter =
        formData.companyName?.trim()?.charAt(0)?.toUpperCase() || "X";
      const fileName =
        documentType === "resume"
          ? `King_${firstLetter}_Resume`
          : `King_${firstLetter}_CoverLetter`;

      const paragraphs = convertTextToParagraphs(content);
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 1080, bottom: 1080, left: 1008, right: 1008 },
              },
            },
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${fileName}.docx`);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      alert("Error exporting Word file.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">
          Nonino Resume Optimizer
        </h1>

        {/* === Form Section === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Job info */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" /> Job Information
            </h2>

            <input
              type="text"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="w-full mb-3 p-2 rounded bg-white/20 placeholder-gray-300"
            />
            <input
              type="text"
              placeholder="Role Title"
              value={formData.roleTitle}
              onChange={(e) =>
                setFormData({ ...formData, roleTitle: e.target.value })
              }
              className="w-full mb-3 p-2 rounded bg-white/20 placeholder-gray-300"
            />
            <textarea
              placeholder="Paste job description here..."
              value={formData.jobDescription}
              onChange={(e) =>
                setFormData({ ...formData, jobDescription: e.target.value })
              }
              className="w-full h-48 p-2 rounded bg-white/20 placeholder-gray-300"
            />
          </div>

          {/* Right: Resume input */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2" /> Your Resume
            </h2>

            <div className="flex justify-between items-center mb-2">
              <label className="cursor-pointer flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200">
                <Upload className="w-4 h-4" /> Upload Resume (.txt)
                <input
                  type="file"
                  hidden
                  accept=".txt"
                  onChange={handleFileUpload}
                />
              </label>
              {!isUsingDefaultResume && (
                <button
                  onClick={resetToDefaultResume}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Reset to Default
                </button>
              )}
            </div>

            <textarea
              value={formData.currentResume}
              onChange={handleResumeTextChange}
              className="w-full h-72 p-2 rounded bg-white/20 placeholder-gray-300"
            />
          </div>
        </div>

        {/* === Generate Button === */}
        <div className="flex justify-center mt-6">
          <button
            onClick={generateOptimizedContent}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Optimized Resume
              </>
            )}
          </button>
        </div>

        {/* === Output Section === */}
        {results && (
          <div className="mt-8 space-y-6">
            <div className="bg-white/10 p-4 rounded-2xl">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" /> Optimized Resume
              </h2>
              <pre className="whitespace-pre-wrap text-sm bg-black/20 p-3 rounded">
                {results.optimizedResume}
              </pre>
              <button
                onClick={() => openInWord(results.optimizedResume, "resume")}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm mt-3"
              >
                Open in Word
              </button>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" /> Cover Letter
              </h2>
              <pre className="whitespace-pre-wrap text-sm bg-black/20 p-3 rounded">
                {results.coverLetter}
              </pre>
              <button
                onClick={() => openInWord(results.coverLetter, "coverletter")}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm mt-3"
              >
                Open in Word
              </button>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" /> Feedback
              </h2>
              <pre className="whitespace-pre-wrap text-sm bg-black/20 p-3 rounded">
                {results.feedback}
              </pre>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-600/80 mt-6 p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}
      </div>
    </div>
  );
}
