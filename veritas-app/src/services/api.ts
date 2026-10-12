import { CaseRecord, OfficerDecision, AuditLogEntry, SystemHealthMetric } from "@/types/veritas";
import { FIXTURE_CASES } from "@/lib/fixtures/cases";
import { FIXTURE_AUDIT_LOGS } from "@/lib/fixtures/audit";
import { FIXTURE_SYSTEM_METRICS } from "@/lib/fixtures/system";

/**
 * VERITAS Application Data Service Layer.
 * In Phase 1, operations interact with a localized in-memory development state
 * pre-populated with realistic mission-critical border fixtures.
 * Designed for transparent drop-in swap with the Python + FastAPI backend in subsequent phases.
 */

class VeritasApiService {
  private cases: CaseRecord[] = [...FIXTURE_CASES];
  private auditLogs: AuditLogEntry[] = [...FIXTURE_AUDIT_LOGS];
  private systemMetrics: SystemHealthMetric[] = [...FIXTURE_SYSTEM_METRICS];

  // Cases API
  async getCases(filters?: {
    search?: string;
    riskLevel?: string;
    status?: string;
  }): Promise<CaseRecord[]> {
    let result = [...this.cases];

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.subject.name.toLowerCase().includes(q) ||
          c.subject.nationality.toLowerCase().includes(q) ||
          c.subject.documentNumber.toLowerCase().includes(q) ||
          c.flight.number.toLowerCase().includes(q)
      );
    }

    if (filters?.riskLevel && filters.riskLevel !== "ALL") {
      result = result.filter((c) => c.riskLevel === filters.riskLevel);
    }

    return result;
  }

  async getCaseById(id: string): Promise<CaseRecord | null> {
    const found = this.cases.find((c) => c.id === id);
    return found || null;
  }

  async createScreeningCase(newCase: Omit<CaseRecord, "id" | "createdAt" | "isDevFixture">): Promise<CaseRecord> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const created: CaseRecord = {
      ...newCase,
      id: `VRS-2026-00${randomSuffix}`,
      createdAt: new Date().toISOString(),
      isDevFixture: true,
      timeline: [
        {
          id: `t-init-${Date.now()}`,
          timestamp: new Date().toISOString().substring(11, 19),
          title: "Screening Initiated (Development Station)",
          description: `Subject ${newCase.subject.name} ingested via manual development pipeline.`,
          type: "info",
          actor: "Insp. S. Jenkins",
        },
        ...newCase.timeline,
      ],
    };

    this.cases.unshift(created);

    // Record audit event
    this.auditLogs.unshift({
      id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      officerBadge: "VR-8842",
      officerName: "Insp. S. Jenkins",
      caseId: created.id,
      action: "DEVELOPMENT_SCREENING_CREATED",
      details: `New screening case generated for ${created.subject.name} (Flight ${created.flight.number}). Composite Risk: ${created.riskScore}/100.`,
      lane: created.lane,
      severity: created.riskLevel === "HIGH" ? "CRITICAL" : created.riskLevel === "MEDIUM" ? "WARN" : "INFO",
    });

    return created;
  }

  async recordOfficerDecision(decision: OfficerDecision): Promise<CaseRecord | null> {
    const caseIndex = this.cases.findIndex((c) => c.id === decision.caseId);
    if (caseIndex === -1) return null;

    const targetCase = this.cases[caseIndex];
    targetCase.decision = decision;

    if (decision.decision === "CLEARED") {
      targetCase.decisionRecommendation = "OFFICER CLEARED";
    } else if (decision.decision === "SECONDARY_REVIEW") {
      targetCase.decisionRecommendation = "REFERRED TO SECONDARY INTERVIEW";
    } else if (decision.decision === "ENTRY_REFUSED") {
      targetCase.decisionRecommendation = "ENTRY REFUSED UNDER ICAO SEC 4";
    } else if (decision.decision === "ESCALATED") {
      targetCase.decisionRecommendation = "ESCALATED TO STATION COMMANDER";
    }

    targetCase.timeline.push({
      id: `t-dec-${Date.now()}`,
      timestamp: new Date().toISOString().substring(11, 19),
      title: `Officer Decision: ${decision.decision}`,
      description: `${decision.notes} (Statutory: ${decision.statutoryDirective})`,
      type: decision.decision === "CLEARED" ? "success" : "critical",
      actor: `${decision.officerName} (${decision.officerBadge})`,
    });

    // Record audit log
    this.auditLogs.unshift({
      id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      officerBadge: decision.officerBadge,
      officerName: decision.officerName,
      caseId: decision.caseId,
      action: `OFFICER_DECISION_${decision.decision}`,
      details: decision.notes,
      lane: targetCase.lane,
      severity: decision.decision === "CLEARED" ? "INFO" : "CRITICAL",
    });

    return targetCase;
  }

  async getAuditLogs(filters?: { officer?: string; severity?: string }): Promise<AuditLogEntry[]> {
    let logs = [...this.auditLogs];
    if (filters?.severity && filters.severity !== "ALL") {
      logs = logs.filter((l) => l.severity === filters.severity);
    }
    return logs;
  }

  async getSystemHealth(): Promise<SystemHealthMetric[]> {
    return [...this.systemMetrics];
  }
}

export const apiService = new VeritasApiService();
