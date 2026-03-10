import { describe, it, expect } from "vitest";
import type {
  InsertComplianceImprovementAction,
  InsertComplianceSnapshot,
  InsertComplianceTrend,
} from "../drizzle/schema";

describe("Compliance History Data Structures", () => {
  describe("ComplianceImprovementAction", () => {
    it("should create valid action with required fields", () => {
      const action: InsertComplianceImprovementAction = {
        organizationId: 1,
        title: "Implementar MFA",
        priority: "critical",
      };

      expect(action.organizationId).toBe(1);
      expect(action.title).toBe("Implementar MFA");
      expect(action.priority).toBe("critical");
    });

    it("should support optional fields", () => {
      const action: InsertComplianceImprovementAction = {
        organizationId: 1,
        title: "Implementar MFA",
        priority: "critical",
        status: "in_progress",
        description: "Implementar autenticação multi-fator em todos os sistemas",
        estimatedEffort: "2-4 semanas",
        deadline: new Date("2026-04-30"),
        relatedNIS2Articles: ["Art. 21", "Art. 22"],
        relatedISO27001Controls: ["A.5.1", "A.5.2"],
        relatedCVEs: ["CVE-2024-1234"],
        expectedImpact: "Reduzir risco de acesso não autorizado em 80%",
      };

      expect(action.status).toBe("in_progress");
      expect(action.description).toBeDefined();
      expect(action.relatedNIS2Articles).toContain("Art. 21");
      expect(action.relatedISO27001Controls).toContain("A.5.1");
    });

    it("should support all priority levels", () => {
      const priorities: Array<"critical" | "high" | "medium" | "low"> = [
        "critical",
        "high",
        "medium",
        "low",
      ];

      priorities.forEach((priority) => {
        const action: InsertComplianceImprovementAction = {
          organizationId: 1,
          title: "Test",
          priority,
        };

        expect(action.priority).toBe(priority);
      });
    });

    it("should support all status values", () => {
      const statuses: Array<"open" | "in_progress" | "completed" | "cancelled"> = [
        "open",
        "in_progress",
        "completed",
        "cancelled",
      ];

      statuses.forEach((status) => {
        const action: InsertComplianceImprovementAction = {
          organizationId: 1,
          title: "Test",
          priority: "high",
          status,
        };

        expect(action.status).toBe(status);
      });
    });
  });

  describe("ComplianceSnapshot", () => {
    it("should create baseline snapshot", () => {
      const snapshot: InsertComplianceSnapshot = {
        organizationId: 1,
        snapshotType: "baseline",
        nis2Score: 45.5,
        iso27001Score: 42.0,
        mitreAttackCoverage: 38.0,
        overallRiskScore: 62.0,
        vulnerabilityCount: 45,
        criticalVulnerabilities: 8,
        complianceGaps: 18,
      };

      expect(snapshot.snapshotType).toBe("baseline");
      expect(snapshot.nis2Score).toBe(45.5);
      expect(snapshot.vulnerabilityCount).toBe(45);
    });

    it("should create before/after action snapshots", () => {
      const before: InsertComplianceSnapshot = {
        organizationId: 1,
        actionId: 1,
        snapshotType: "before_action",
        nis2Score: 45.5,
        vulnerabilityCount: 45,
        criticalVulnerabilities: 8,
      };

      const after: InsertComplianceSnapshot = {
        organizationId: 1,
        actionId: 1,
        snapshotType: "after_action",
        nis2Score: 54.0,
        vulnerabilityCount: 38,
        criticalVulnerabilities: 5,
      };

      expect(before.snapshotType).toBe("before_action");
      expect(after.snapshotType).toBe("after_action");
      expect(after.nis2Score! > before.nis2Score!).toBe(true);
    });

    it("should create periodic snapshots", () => {
      const snapshot: InsertComplianceSnapshot = {
        organizationId: 1,
        snapshotType: "periodic",
        nis2Score: 65.0,
        iso27001Score: 63.0,
        mitreAttackCoverage: 60.0,
        notes: "Snapshot mensal de conformidade",
      };

      expect(snapshot.snapshotType).toBe("periodic");
      expect(snapshot.notes).toBeDefined();
    });
  });

  describe("ComplianceTrend", () => {
    it("should create monthly trend", () => {
      const trend: InsertComplianceTrend = {
        organizationId: 1,
        month: "2026-03",
        nis2ScoreAverage: 65.0,
        iso27001ScoreAverage: 63.0,
        mitreAttackCoverageAverage: 60.0,
        actionsCompletedCount: 2,
        vulnerabilitiesResolvedCount: 7,
      };

      expect(trend.month).toBe("2026-03");
      expect(trend.nis2ScoreAverage).toBe(65.0);
      expect(trend.actionsCompletedCount).toBe(2);
    });

    it("should support month format YYYY-MM", () => {
      const months = ["2026-01", "2026-02", "2026-03", "2026-12"];

      months.forEach((month) => {
        const trend: InsertComplianceTrend = {
          organizationId: 1,
          month,
          nis2ScoreAverage: 65.0,
        };

        expect(trend.month).toMatch(/^\d{4}-\d{2}$/);
      });
    });
  });

  describe("Compliance Improvement Calculation", () => {
    it("should calculate improvement between snapshots", () => {
      const before = {
        nis2Score: 45.5,
        iso27001Score: 42.0,
        mitreAttackCoverage: 38.0,
        vulnerabilityCount: 45,
        criticalVulnerabilities: 8,
      };

      const after = {
        nis2Score: 54.0,
        iso27001Score: 51.5,
        mitreAttackCoverage: 48.0,
        vulnerabilityCount: 38,
        criticalVulnerabilities: 5,
      };

      const improvement = {
        nis2: after.nis2Score - before.nis2Score,
        iso27001: after.iso27001Score - before.iso27001Score,
        mitre: after.mitreAttackCoverage - before.mitreAttackCoverage,
        vulnerabilities: before.vulnerabilityCount - after.vulnerabilityCount,
        critical: before.criticalVulnerabilities - after.criticalVulnerabilities,
      };

      expect(improvement.nis2).toBe(8.5);
      expect(improvement.iso27001).toBe(9.5);
      expect(improvement.mitre).toBe(10.0);
      expect(improvement.vulnerabilities).toBe(7);
      expect(improvement.critical).toBe(3);
    });

    it("should handle zero improvement", () => {
      const before = { nis2Score: 50.0, vulnerabilityCount: 20 };
      const after = { nis2Score: 50.0, vulnerabilityCount: 20 };

      const improvement = {
        nis2: after.nis2Score - before.nis2Score,
        vulnerabilities: before.vulnerabilityCount - after.vulnerabilityCount,
      };

      expect(improvement.nis2).toBe(0);
      expect(improvement.vulnerabilities).toBe(0);
    });

    it("should handle negative improvement (regression)", () => {
      const before = { nis2Score: 65.0, vulnerabilityCount: 20 };
      const after = { nis2Score: 60.0, vulnerabilityCount: 25 };

      const improvement = {
        nis2: after.nis2Score - before.nis2Score,
        vulnerabilities: before.vulnerabilityCount - after.vulnerabilityCount,
      };

      expect(improvement.nis2).toBe(-5.0);
      expect(improvement.vulnerabilities).toBe(-5);
    });
  });

  describe("Compliance Progress Tracking", () => {
    it("should track overall progress from baseline to current", () => {
      const baseline = {
        nis2Score: 45.5,
        iso27001Score: 42.0,
        vulnerabilityCount: 45,
        criticalVulnerabilities: 8,
      };

      const current = {
        nis2Score: 68.0,
        iso27001Score: 66.0,
        vulnerabilityCount: 18,
        criticalVulnerabilities: 1,
      };

      const progress = {
        baseline,
        current,
        improvement: {
          nis2: current.nis2Score - baseline.nis2Score,
          iso27001: current.iso27001Score - baseline.iso27001Score,
          vulnerabilities: baseline.vulnerabilityCount - current.vulnerabilityCount,
          critical: baseline.criticalVulnerabilities - current.criticalVulnerabilities,
        },
      };

      expect(progress.improvement.nis2).toBe(22.5);
      expect(progress.improvement.iso27001).toBe(24.0);
      expect(progress.improvement.vulnerabilities).toBe(27);
      expect(progress.improvement.critical).toBe(7);
    });

    it("should calculate percentage improvement", () => {
      const baseline = { nis2Score: 45.5 };
      const current = { nis2Score: 68.0 };

      const percentageImprovement =
        ((current.nis2Score - baseline.nis2Score) / baseline.nis2Score) * 100;

      expect(percentageImprovement).toBeCloseTo(49.45, 1);
    });
  });

  describe("Action Impact Tracking", () => {
    it("should track expected vs actual impact", () => {
      const action: InsertComplianceImprovementAction = {
        organizationId: 1,
        title: "Implementar MFA",
        priority: "critical",
        status: "completed",
        expectedImpact: "Reduzir risco de acesso não autorizado em 80%",
        actualImpact: "Reduzir risco de acesso não autorizado em 85%",
      };

      expect(action.expectedImpact).toBeDefined();
      expect(action.actualImpact).toBeDefined();
      expect(action.actualImpact).not.toBe(action.expectedImpact);
    });

    it("should track effort estimation vs actual", () => {
      const action: InsertComplianceImprovementAction = {
        organizationId: 1,
        title: "Implementar DLP",
        priority: "high",
        status: "completed",
        estimatedEffort: "2-4 semanas",
        actualEffort: "3 semanas",
      };

      expect(action.estimatedEffort).toBe("2-4 semanas");
      expect(action.actualEffort).toBe("3 semanas");
    });
  });
});
