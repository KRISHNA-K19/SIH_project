export interface Evidence {
  id: string;
  category: string;
  finding: string;
  severity: "critical" | "warning" | "success" | "info";
  source: string;
  description: string;
  status?: string;
  metrics?: { label: string; value: string }[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: "info" | "critical" | "warning" | "success";
}

export interface CaseData {
  id: string;
  subject: {
    name: string;
    dob: string;
    nationality: string;
  };
  flight: {
    number: string;
    route: string;
    seat: string;
  };
  checkpoint: string;
  riskScore: number;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  decisionRecommendation: string;
  documents: {
    id: string;
    type: string;
    status: string;
    issuePost: string;
  }[];
  evidence: Evidence[];
  timeline: TimelineEvent[];
}

export const MOCK_CASE: CaseData = {
  id: "VRS-2026-001824",
  subject: {
    name: "CHANDRAKAAR, ROHAN",
    dob: "14 APR 1997 / 1998",
    nationality: "GBR",
  },
  flight: {
    number: "BA-178",
    route: "LHR → JFK",
    seat: "14A (Club World)",
  },
  checkpoint: "DELTA-01",
  riskScore: 82,
  riskLevel: "HIGH",
  decisionRecommendation: "SECONDARY REVIEW REQUIRED",
  documents: [
    {
      id: "Z4567123",
      type: "UK Passport",
      status: "Valid ICAO-9303",
      issuePost: "London (LND)",
    },
    {
      id: "VR-0914-US",
      type: "US B1/B2 Visa",
      status: "Active / Valid",
      issuePost: "London (LND)",
    },
  ],
  evidence: [
    {
      id: "ev-1",
      category: "FACE VERIFICATION",
      finding: "LIVE CAMERA vs. E-CHIP BIOMETRIC",
      severity: "critical",
      source: "Biometric Engine",
      description: "Presented person at checkpoint Delta-01 failed threshold convergence against e-Passport DG2 facial record.",
      metrics: [
        { label: "Delta Distance", value: "0.572" },
        { label: "Match Score", value: "42.8%" },
      ],
    },
    {
      id: "ev-2",
      category: "CROSS-DOCUMENT CORRELATION",
      finding: "TRAVEL MANIFEST VS. US VISA EXTRACT",
      severity: "warning",
      source: "Identity Intelligence",
      description: "Passport document records birthdate as 14 APR 1997, while US Visa schema registers birthdate as 14 APR 1998.",
      metrics: [
        { label: "Delta", value: "+365 Days" },
        { label: "Type", value: "DOB Conflict" },
      ],
    },
    {
      id: "ev-3",
      category: "DOCUMENT FORENSICS",
      finding: "PHYSICAL SUBSTRATE INCISION",
      severity: "critical",
      source: "Spectral Analysis 380NM UV",
      description: "Co-axial multispectral illumination detected sharp 0.12mm razor score lines adjacent to photo box edge.",
      metrics: [
        { label: "Cut Depth", value: "0.12mm" },
        { label: "Optic Band", value: "Infrared 850nm" },
      ],
    },
  ],
  timeline: [
    {
      id: "t-1",
      timestamp: "08:41:02",
      title: "Screening Record Created",
      description: "Boarding pass scanned at turnstile. Passenger routed to Lane 4.",
      type: "info",
    },
    {
      id: "t-2",
      timestamp: "08:41:17",
      title: "Document Captured",
      description: "UK Passport scanned on platen (MRZ and chip extracted).",
      type: "info",
    },
    {
      id: "t-3",
      timestamp: "08:41:31",
      title: "Forensic Anomaly Detected",
      description: "Automated computer vision flagged 0.12mm razor incision.",
      type: "critical",
    },
    {
      id: "t-4",
      timestamp: "08:41:35",
      title: "Face Comparison Completed (42.8%)",
      description: "Live optical frame diverged from DG2 chip reference photo.",
      type: "warning",
    },
    {
      id: "t-5",
      timestamp: "08:42:04",
      title: "Secondary Review Triggered",
      description: "Automated referral assigned to Station Inspector.",
      type: "critical",
    },
  ],
};
