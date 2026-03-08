import { describe, it, expect } from "vitest";
import { generateActionPlan, generateNIS2Coverage, generateHTMLReport, generateJSONReport } from "./report-generator";
import type { Vulnerability } from "../../drizzle/schema";

const mockVulnerabilities: Vulnerability[] = [
  {
    id: 1,
    scanId: 1,
    cveId: "CVE-2024-1234",
    title: "SQL Injection em Login",
    description: "Vulnerabilidade de SQL Injection no formulário de login",
    cvssScore: "9.8",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    severity: "critical",
    affectedSoftware: "Apache Struts",
    affectedVersion: "2.3.15",
    publishedDate: new Date("2024-01-15"),
    exploitAvailable: true,
    exploitUrl: "https://example.com/exploit",
    remediationAvailable: true,
    remediationDetails: "Atualizar para versão 2.3.16 ou superior",
    nis2Articles: '["Art. 21", "Art. 22"]',
    createdAt: new Date(),
  },
  {
    id: 2,
    scanId: 1,
    cveId: "CVE-2024-5678",
    title: "Cross-Site Scripting (XSS)",
    description: "Vulnerabilidade XSS em comentários de usuários",
    cvssScore: "7.5",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N",
    severity: "high",
    affectedSoftware: "WordPress",
    affectedVersion: "6.1.0",
    publishedDate: new Date("2024-02-10"),
    exploitAvailable: false,
    remediationAvailable: true,
    remediationDetails: "Instalar plugin de segurança ou atualizar WordPress",
    nis2Articles: '["Art. 21"]',
    createdAt: new Date(),
  },
  {
    id: 3,
    scanId: 1,
    cveId: "CVE-2024-9012",
    title: "Weak SSL Configuration",
    description: "Configuração fraca de SSL/TLS",
    cvssScore: "5.3",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N",
    severity: "medium",
    affectedSoftware: "Nginx",
    affectedVersion: "1.18.0",
    publishedDate: new Date("2024-03-05"),
    exploitAvailable: false,
    remediationAvailable: true,
    remediationDetails: "Atualizar configuração de SSL para TLS 1.2+",
    nis2Articles: '["Art. 22"]',
    createdAt: new Date(),
  },
  {
    id: 4,
    scanId: 1,
    cveId: "CVE-2024-3456",
    title: "Outdated Library",
    description: "Biblioteca desatualizada com vulnerabilidades conhecidas",
    cvssScore: "4.7",
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:N/A:N",
    severity: "low",
    affectedSoftware: "jQuery",
    affectedVersion: "1.11.0",
    publishedDate: new Date("2024-01-20"),
    exploitAvailable: false,
    remediationAvailable: true,
    remediationDetails: "Atualizar jQuery para versão 3.6.0+",
    nis2Articles: '["Art. 25"]',
    createdAt: new Date(),
  },
];

describe("Report Generator", () => {
  describe("generateActionPlan", () => {
    it("should generate action items for critical vulnerabilities", () => {
      const actionPlan = generateActionPlan(mockVulnerabilities);

      expect(actionPlan.length).toBeGreaterThan(0);
      expect(actionPlan.some((a) => a.priority === "critical")).toBe(true);
    });

    it("should prioritize critical vulnerabilities with 24-hour deadline", () => {
      const actionPlan = generateActionPlan(mockVulnerabilities);
      const criticalActions = actionPlan.filter((a) => a.priority === "critical");

      expect(criticalActions.length).toBeGreaterThan(0);
      criticalActions.forEach((action) => {
        const deadline = new Date(action.deadline);
        const now = new Date();
        const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        expect(diffHours).toBeLessThanOrEqual(24);
      });
    });

    it("should include high priority items with 1-week deadline", () => {
      const actionPlan = generateActionPlan(mockVulnerabilities);
      const highActions = actionPlan.filter((a) => a.priority === "high");

      expect(highActions.length).toBeGreaterThan(0);
      highActions.forEach((action) => {
        const deadline = new Date(action.deadline);
        const now = new Date();
        const diffDays = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffDays).toBeLessThanOrEqual(7);
      });
    });

    it("should include NIS2 article references", () => {
      const actionPlan = generateActionPlan(mockVulnerabilities);

      actionPlan.forEach((action) => {
        expect(action.nis2Article).toMatch(/Art\. \d+/);
      });
    });

    it("should include effort estimates", () => {
      const actionPlan = generateActionPlan(mockVulnerabilities);
      const validEfforts = ["1-2h", "3-8h", "1-3d", "1-2w", "2w+"];

      actionPlan.forEach((action) => {
        expect(validEfforts).toContain(action.estimatedEffort);
      });
    });
  });

  describe("generateNIS2Coverage", () => {
    it("should generate coverage for all NIS2 articles", () => {
      const coverage = generateNIS2Coverage(mockVulnerabilities);

      expect(coverage.length).toBeGreaterThan(0);
      expect(coverage.some((c) => c.article === "Art. 21")).toBe(true);
      expect(coverage.some((c) => c.article === "Art. 22")).toBe(true);
    });

    it("should mark as partial compliance when vulnerabilities exist", () => {
      const coverage = generateNIS2Coverage(mockVulnerabilities);

      coverage.forEach((c) => {
        expect(["compliant", "partial"]).toContain(c.status);
      });
    });

    it("should mark as compliant when no vulnerabilities", () => {
      const coverage = generateNIS2Coverage([]);

      coverage.forEach((c) => {
        expect(c.status).toBe("compliant");
      });
    });
  });

  describe("generateHTMLReport", () => {
    it("should generate valid HTML", () => {
      const reportData = {
        title: "Test Report",
        generatedAt: new Date().toISOString(),
        organizationName: "Test Org",
        scanId: 1,
        targetRange: "192.168.1.0/24",
        vulnerabilities: mockVulnerabilities,
        summary: {
          totalVulnerabilities: 4,
          criticalCount: 1,
          highCount: 1,
          mediumCount: 1,
          lowCount: 1,
          complianceScore: 80,
        },
      };

      const html = generateHTMLReport(reportData);

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("</html>");
      expect(html).toContain(reportData.title);
      expect(html).toContain(reportData.organizationName);
    });

    it("should include vulnerability details in HTML", () => {
      const reportData = {
        title: "Test Report",
        generatedAt: new Date().toISOString(),
        organizationName: "Test Org",
        scanId: 1,
        targetRange: "192.168.1.0/24",
        vulnerabilities: mockVulnerabilities,
        summary: {
          totalVulnerabilities: 4,
          criticalCount: 1,
          highCount: 1,
          mediumCount: 1,
          lowCount: 1,
          complianceScore: 80,
        },
      };

      const html = generateHTMLReport(reportData);

      mockVulnerabilities.forEach((vuln) => {
        expect(html).toContain(vuln.cveId);
        expect(html).toContain(vuln.title);
      });
    });

    it("should include action plan in HTML when provided", () => {
      const actionPlan = generateActionPlan(mockVulnerabilities);
      const reportData = {
        title: "Test Report",
        generatedAt: new Date().toISOString(),
        organizationName: "Test Org",
        scanId: 1,
        targetRange: "192.168.1.0/24",
        vulnerabilities: mockVulnerabilities,
        summary: {
          totalVulnerabilities: 4,
          criticalCount: 1,
          highCount: 1,
          mediumCount: 1,
          lowCount: 1,
          complianceScore: 80,
        },
        actionPlan,
      };

      const html = generateHTMLReport(reportData);

      expect(html).toContain("Plano de Ação");
      actionPlan.forEach((action) => {
        expect(html).toContain(action.nis2Article);
      });
    });
  });

  describe("generateJSONReport", () => {
    it("should generate valid JSON", () => {
      const reportData = {
        title: "Test Report",
        generatedAt: new Date().toISOString(),
        organizationName: "Test Org",
        scanId: 1,
        targetRange: "192.168.1.0/24",
        vulnerabilities: mockVulnerabilities,
        summary: {
          totalVulnerabilities: 4,
          criticalCount: 1,
          highCount: 1,
          mediumCount: 1,
          lowCount: 1,
          complianceScore: 80,
        },
      };

      const json = generateJSONReport(reportData);
      const parsed = JSON.parse(json);

      expect(parsed.title).toBe(reportData.title);
      expect(parsed.organizationName).toBe(reportData.organizationName);
      expect(parsed.vulnerabilities.length).toBe(4);
    });

    it("should include all vulnerability details in JSON", () => {
      const reportData = {
        title: "Test Report",
        generatedAt: new Date().toISOString(),
        organizationName: "Test Org",
        scanId: 1,
        targetRange: "192.168.1.0/24",
        vulnerabilities: mockVulnerabilities,
        summary: {
          totalVulnerabilities: 4,
          criticalCount: 1,
          highCount: 1,
          mediumCount: 1,
          lowCount: 1,
          complianceScore: 80,
        },
      };

      const json = generateJSONReport(reportData);
      const parsed = JSON.parse(json);

      expect(parsed.vulnerabilities[0].cveId).toBe("CVE-2024-1234");
      expect(parsed.vulnerabilities[0].severity).toBe("critical");
    });
  });
});
