import { describe, it, expect } from "vitest";
import {
  calculateMitreAttackCoverage,
  generateMitreAnalysisReport,
  mapCVEToMitre,
  getMitreTactics,
} from "./mitre-attack";
import {
  mapVulnerabilityToControls,
  calculateComplianceStatus,
  getComplianceGaps,
  generateISO27001Report,
  getISO27001Domains,
} from "./iso27001-mapper";

const mockVulnerabilities = [
  {
    id: 1,
    cveId: "CVE-2024-1234",
    title: "SQL Injection em Login",
    severity: "critical",
    cvssScore: "9.8",
    affectedSoftware: "Apache Struts",
  },
  {
    id: 2,
    cveId: "CVE-2024-5678",
    title: "Cross-Site Scripting (XSS)",
    severity: "high",
    cvssScore: "7.5",
    affectedSoftware: "WordPress",
  },
  {
    id: 3,
    cveId: "CVE-2024-9012",
    title: "Weak SSL Configuration",
    severity: "medium",
    cvssScore: "5.3",
    affectedSoftware: "Nginx",
  },
];

describe("MITRE ATT&CK Integration", () => {
  describe("getMitreTactics", () => {
    it("should return all 14 MITRE tactics", () => {
      const tactics = getMitreTactics();
      expect(tactics).toHaveLength(14);
      expect(tactics[0].name).toBe("Reconnaissance");
      expect(tactics[13].name).toBe("Impact");
    });

    it("should include all tactic IDs", () => {
      const tactics = getMitreTactics();
      const ids = tactics.map((t) => t.id);
      expect(ids).toContain("TA0043"); // Reconnaissance
      expect(ids).toContain("TA0040"); // Impact
    });
  });

  describe("mapCVEToMitre", () => {
    it("should map known CVE to MITRE techniques", () => {
      const mapping = mapCVEToMitre("CVE-2024-1234");
      expect(mapping).not.toBeNull();
      expect(mapping?.techniques).toHaveLength(2);
      expect(mapping?.techniques[0].tactic).toBe("Initial Access");
    });

    it("should return null for unknown CVE", () => {
      const mapping = mapCVEToMitre("CVE-9999-9999");
      expect(mapping).toBeNull();
    });

    it("should include confidence scores", () => {
      const mapping = mapCVEToMitre("CVE-2024-1234");
      expect(mapping?.techniques[0].confidence).toBeGreaterThan(0);
      expect(mapping?.techniques[0].confidence).toBeLessThanOrEqual(1);
    });
  });

  describe("calculateMitreAttackCoverage", () => {
    it("should calculate coverage percentage", () => {
      const coverage = calculateMitreAttackCoverage(mockVulnerabilities);
      expect(coverage.coverage).toBeGreaterThan(0);
      expect(coverage.coverage).toBeLessThanOrEqual(100);
    });

    it("should identify covered tactics", () => {
      const coverage = calculateMitreAttackCoverage(mockVulnerabilities);
      expect(coverage.tacticsCovered.length).toBeGreaterThan(0);
      expect(coverage.tacticsCovered).toContain("Initial Access");
    });

    it("should identify uncovered tactics", () => {
      const coverage = calculateMitreAttackCoverage(mockVulnerabilities);
      expect(coverage.tacticsNotCovered.length).toBeGreaterThan(0);
    });

    it("should calculate risk by tactic", () => {
      const coverage = calculateMitreAttackCoverage(mockVulnerabilities);
      expect(Object.keys(coverage.riskByTactic).length).toBeGreaterThan(0);
      Object.values(coverage.riskByTactic).forEach((risk) => {
        expect(risk).toBeGreaterThanOrEqual(0);
        expect(risk).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("generateMitreAnalysisReport", () => {
    it("should generate comprehensive report", () => {
      const report = generateMitreAnalysisReport(mockVulnerabilities);
      expect(report.summary).toBeDefined();
      expect(report.coverage).toBeDefined();
      expect(report.topThreats).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it("should include top 3 threats", () => {
      const report = generateMitreAnalysisReport(mockVulnerabilities);
      expect(report.topThreats.length).toBeLessThanOrEqual(3);
    });

    it("should generate defensive recommendations", () => {
      const report = generateMitreAnalysisReport(mockVulnerabilities);
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations[0]).toContain("Implementar");
    });
  });
});

describe("ISO 27001 Mapper", () => {
  describe("getISO27001Domains", () => {
    it("should return all 14 ISO 27001 domains", () => {
      const domains = getISO27001Domains();
      expect(domains).toHaveLength(14);
      expect(domains[0].code).toBe("A.5");
      expect(domains[13].code).toBe("A.18");
    });

    it("should include domain metadata", () => {
      const domains = getISO27001Domains();
      const domain = domains[0];
      expect(domain.name).toBeDefined();
      expect(domain.description).toBeDefined();
      expect(domain.controlCount).toBeGreaterThan(0);
      expect(domain.category).toBeDefined();
    });
  });

  describe("mapVulnerabilityToControls", () => {
    it("should map SQL injection to relevant controls", () => {
      const mapping = mapVulnerabilityToControls(mockVulnerabilities[0]);
      expect(mapping.length).toBeGreaterThan(0);
      expect(mapping.some((m) => m.controlId === "A.14.2")).toBe(true); // Secure development
    });

    it("should map XSS to relevant controls", () => {
      const mapping = mapVulnerabilityToControls(mockVulnerabilities[1]);
      expect(mapping.length).toBeGreaterThan(0);
      expect(mapping.some((m) => m.controlId === "A.14.2")).toBe(true);
    });

    it("should map SSL/TLS issues to cryptography controls", () => {
      const mapping = mapVulnerabilityToControls(mockVulnerabilities[2]);
      expect(mapping.length).toBeGreaterThan(0);
      // Should include cryptography-related controls
      expect(mapping.some((m) => m.controlId.startsWith("A.10") || m.controlId.startsWith("A.13"))).toBe(true);
    });

    it("should include relevance levels", () => {
      const mapping = mapVulnerabilityToControls(mockVulnerabilities[0]);
      mapping.forEach((m) => {
        expect(["critical", "high", "medium", "low"]).toContain(m.relevance);
      });
    });
  });

  describe("calculateComplianceStatus", () => {
    it("should calculate compliance by domain", () => {
      const status = calculateComplianceStatus(["A.5.1", "A.9.1", "A.9.2"]);
      expect(status.length).toBeGreaterThan(0);
      expect(status[0].domain).toBeDefined();
      expect(status[0].implementedControls).toBeGreaterThanOrEqual(0);
      expect(status[0].totalControls).toBeGreaterThan(0);
    });

    it("should calculate compliance percentage", () => {
      const status = calculateComplianceStatus(["A.5.1", "A.9.1"]);
      status.forEach((s) => {
        expect(s.compliancePercentage).toBeGreaterThanOrEqual(0);
        expect(s.compliancePercentage).toBeLessThanOrEqual(100);
      });
    });

    it("should assign compliance status", () => {
      const status = calculateComplianceStatus(["A.5.1", "A.9.1"]);
      status.forEach((s) => {
        expect(["compliant", "partial", "non_compliant"]).toContain(s.status);
      });
    });

    it("should mark as compliant when >= 80%", () => {
      // Assuming we have enough controls implemented
      const allControls = [
        "A.5.1",
        "A.5.2",
        "A.6.1",
        "A.6.2",
        "A.9.1",
        "A.9.2",
        "A.9.3",
        "A.9.4",
        "A.12.1",
        "A.12.2",
        "A.14.1",
        "A.14.2",
        "A.16.1",
      ];
      const status = calculateComplianceStatus(allControls);
      const compliantDomains = status.filter((s) => s.status === "compliant");
      expect(compliantDomains.length).toBeGreaterThan(0);
    });
  });

  describe("getComplianceGaps", () => {
    it("should identify unimplemented controls", () => {
      const gaps = getComplianceGaps(["A.5.1"]);
      expect(gaps.length).toBeGreaterThan(0);
      expect(gaps.every((g) => g.id !== "A.5.1")).toBe(true);
    });

    it("should return all controls when none implemented", () => {
      const gaps = getComplianceGaps([]);
      expect(gaps.length).toBeGreaterThan(0);
    });
  });

  describe("generateISO27001Report", () => {
    it("should generate comprehensive report", () => {
      const report = generateISO27001Report(mockVulnerabilities, ["A.5.1", "A.9.1"]);
      expect(report.overallCompliance).toBeDefined();
      expect(report.statusByDomain).toBeDefined();
      expect(report.gaps).toBeDefined();
      expect(report.vulnerabilityMappings).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it("should calculate overall compliance", () => {
      const report = generateISO27001Report(mockVulnerabilities, ["A.5.1", "A.9.1"]);
      expect(report.overallCompliance).toBeGreaterThanOrEqual(0);
      expect(report.overallCompliance).toBeLessThanOrEqual(100);
    });

    it("should map vulnerabilities to controls", () => {
      const report = generateISO27001Report(mockVulnerabilities, []);
      expect(Object.keys(report.vulnerabilityMappings).length).toBeGreaterThan(0);
      expect(report.vulnerabilityMappings["CVE-2024-1234"]).toBeDefined();
    });

    it("should generate recommendations", () => {
      const report = generateISO27001Report(mockVulnerabilities, []);
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations[0]).toContain("Implementar");
    });
  });
});
