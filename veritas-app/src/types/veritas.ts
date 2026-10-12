export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";
export type SeverityLevel = "critical" | "warning" | "success" | "info" | "neutral";
export type DecisionType = "CLEARED" | "SECONDARY_REVIEW" | "ENTRY_REFUSED" | "ESCALATED";

export interface TravelerSubject {
  name: string;
  dob: string;
  nationality: string;
  documentNumber: string;
  gender: string;
  photoUrl: string;
  livePhotoUrl: string;
  aliases?: string[];
  travelHistoryAlerts?: string[];
}

export interface FlightDetails {
  number: string;
  airline: string;
  route: string;
  seat: string;
  cabinClass: string;
  scheduledArrival: string;
  lane: string;
  checkpoint: string;
}

export interface MrzField {
  label: string;
  raw: string;
  parsed: string;
  valid: boolean;
}

export interface DocumentItem {
  id: string;
  type: string;
  documentNumber: string;
  issuingCountry: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  issuePost: string;
  mrzRaw: string[];
  mrzValid: boolean;
  mrzFields: MrzField[];
  chipVerified: boolean;
  chipProtocol: string;
  docImage: string;
  uvImage?: string;
}

export interface EvidenceMetric {
  label: string;
  value: string;
  pass?: boolean;
}

export interface EvidenceFinding {
  id: string;
  category: "FACE VERIFICATION" | "CROSS-DOCUMENT CORRELATION" | "DOCUMENT FORENSICS" | "MRZ VALIDATION & CHECKSUM" | "WATCHLIST SCREENING";
  finding: string;
  severity: "critical" | "warning" | "success" | "info";
  source: string;
  description: string;
  status?: string;
  metrics?: EvidenceMetric[];
  anomalyVector?: string;
  coordinates?: { x: number; y: number; w: number; h: number };
  algorithmConfidence?: string;
  detectionBand?: string;
}

export interface BiometricTelemetry {
  passportPhotoUrl: string;
  livePhotoUrl: string;
  similarityScore: number; // e.g. 42.8
  thresholdRequired: number; // e.g. 75.0 or 85.0
  deltaDistance: number; // e.g. 0.572
  antiSpoofConfidence: number; // e.g. 99.1%
  livenessVerified: boolean;
  facialMeshPoints: number; // e.g. 468
  comparisonStatus: "NON_CONVERGENCE" | "VERIFIED" | "INDETERMINATE";
  advisoryNote: string;
}

export interface ForensicAnomaly {
  id: string;
  title: string;
  type: string;
  severity: "critical" | "warning" | "info";
  band: "UV_380NM" | "IR_850NM" | "COAXIAL" | "WHITE_LIGHT";
  description: string;
  cutDepth?: string;
  coordinates: { x: number; y: number; label: string };
  imageUrl: string;
}

export interface CrossCheckRecord {
  field: string;
  primaryValue: string;
  primarySource: string;
  secondaryValue: string;
  secondarySource: string;
  status: "MATCH" | "DISCREPANCY" | "UNVERIFIED";
  delta?: string;
  severity: "critical" | "warning" | "success";
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: "info" | "critical" | "warning" | "success";
  actor?: string;
}

export interface OfficerDecision {
  caseId: string;
  decision: DecisionType;
  officerBadge: string;
  officerName: string;
  notes: string;
  timestamp: string;
  statutoryDirective: string;
  overrideAuthorized?: boolean;
}

export interface CaseRecord {
  id: string;
  createdAt: string;
  checkpoint: string;
  lane: string;
  riskScore: number;
  riskLevel: RiskLevel;
  decisionRecommendation: string;
  subject: TravelerSubject;
  flight: FlightDetails;
  documents: DocumentItem[];
  evidence: EvidenceFinding[];
  biometrics: BiometricTelemetry;
  forensics: ForensicAnomaly[];
  crossChecks: CrossCheckRecord[];
  timeline: TimelineEvent[];
  decision?: OfficerDecision;
  isDevFixture?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  officerBadge: string;
  officerName: string;
  caseId: string;
  action: string;
  details: string;
  lane: string;
  severity: "INFO" | "WARN" | "CRITICAL";
}

export interface SystemHealthMetric {
  serviceId: string;
  name: string;
  category: "AI ENGINE" | "OPTICAL HARDWARE" | "IMMIGRATION DB" | "SECURITY GATEWAY";
  status: "OPERATIONAL" | "DEGRADED" | "STANDBY";
  latencyMs: number;
  uptime: string;
  version: string;
  lastHeartbeat: string;
  details: string;
}
