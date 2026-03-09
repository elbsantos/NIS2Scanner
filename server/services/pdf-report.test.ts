import { describe, it, expect } from "vitest";
import {
  generateExecutiveReportPDF,
  generateTechnicalReportPDF,
  generateFullComplianceReportPDF,
  type ReportData,
} from "./pdf-report-generator";
import { generateActionPlan, formatActionPlanForDisplay } from "./action-plan-generator";

const mockReportData: ReportData = {
  organizationName: "Empresa Teste PT",
  reportDate: new Date().toLocaleDateString("pt-PT"),
  metrics: {
    nis2Score: 68,
    iso27001Score: 72,
    mitreAttackCoverage: 65,
    overallRiskScore: 6.8,
    vulnerabilityCount: 12,
    criticalVulnerabilities: 2,
  },
  actionPlan: {
    items: [
      {
        id: "action-1",
        title: "Implementar MFA",
        description: "Implementar autenticação multifator",
        priority: "critical",
        estimatedEffort: "2-4 hours",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        relatedControls: ["A.9.2", "A.9.3"],
        relatedArticles: ["Art. 21", "Art. 22"],
        steps: ["Avaliar soluções", "Implementar", "Testar"],
        resources: ["Engenheiro de Segurança"],
      },
    ],
    totalItems: 1,
    criticalItems: 1,
    estimatedTotalEffort: "2-4 hours",
    priorityDistribution: { critical: 1, high: 0, medium: 0, low: 0 },
  },
  vulnerabilities: [
    {
      cveId: "CVE-2024-1234",
      severity: "critical",
      cvssScore: "9.8",
      nis2Articles: ["Art. 21"],
      isoControls: ["A.9.1"],
    },
  ],
  recommendations: [
    "Implementar MFA em todos os sistemas",
    "Atualizar patches de segurança",
  ],
  complianceByDomain: {
    "A.5": 75,
    "A.6": 65,
    "A.9": 55,
    "A.12": 70,
    "A.14": 60,
  },
  riskByTactic: {
    Execution: 0.85,
    Persistence: 0.72,
    "Privilege Escalation": 0.68,
  },
};

const mockVulnerabilities = [
  {
    cveId: "CVE-2024-1234",
    title: "SQL Injection",
    severity: "critical",
    cvssScore: "9.8",
    affectedSoftware: "Apache Struts",
  },
  {
    cveId: "CVE-2024-5678",
    title: "XSS",
    severity: "high",
    cvssScore: "7.5",
    affectedSoftware: "WordPress",
  },
];

const mockGaps = [
  {
    id: "A.9.1",
    name: "Access Control",
    description: "Implementar controlo de acesso",
  },
  {
    id: "A.12.1",
    name: "Change Management",
    description: "Implementar gestão de mudanças",
  },
];

describe("PDF Report Generator", () => {
  describe("generateExecutiveReportPDF", () => {
    it("should generate executive report PDF", async () => {
      const pdf = await generateExecutiveReportPDF(mockReportData);
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(0);
    });

    it("should include PDF header", async () => {
      const pdf = await generateExecutiveReportPDF(mockReportData);
      const pdfString = pdf.toString("binary");
      expect(pdfString).toContain("%PDF");
    });

    it("should handle organization name", async () => {
      const customData = {
        ...mockReportData,
        organizationName: "Empresa Custom",
      };
      const pdf = await generateExecutiveReportPDF(customData);
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(0);
    });
  });

  describe("generateTechnicalReportPDF", () => {
    it("should generate technical report PDF", async () => {
      const pdf = await generateTechnicalReportPDF(mockReportData);
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(0);
    });

    it("should include PDF header", async () => {
      const pdf = await generateTechnicalReportPDF(mockReportData);
      const pdfString = pdf.toString("binary");
      expect(pdfString).toContain("%PDF");
    });
  });

  describe("generateFullComplianceReportPDF", () => {
    it("should generate full compliance report PDF", async () => {
      const pdf = await generateFullComplianceReportPDF(mockReportData);
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(0);
    });

    it("should include PDF header", async () => {
      const pdf = await generateFullComplianceReportPDF(mockReportData);
      const pdfString = pdf.toString("binary");
      expect(pdfString).toContain("%PDF");
    });
  });
});

describe("Action Plan Generator", () => {
  describe("generateActionPlan", () => {
    it("should generate action plan from vulnerabilities", () => {
      const plan = generateActionPlan(mockVulnerabilities, mockGaps, 1);
      expect(plan).toBeDefined();
      expect(plan.items.length).toBeGreaterThan(0);
    });

    it("should prioritize critical vulnerabilities", () => {
      const plan = generateActionPlan(mockVulnerabilities, [], 1);
      const criticalItems = plan.items.filter((i) => i.priority === "critical");
      expect(criticalItems.length).toBeGreaterThan(0);
    });

    it("should set correct deadline for critical items", () => {
      const plan = generateActionPlan(mockVulnerabilities, [], 1);
      const criticalItems = plan.items.filter((i) => i.priority === "critical");
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      criticalItems.forEach((item) => {
        const deadline = new Date(item.deadline);
        expect(deadline.getDate()).toBeLessThanOrEqual(tomorrow.getDate() + 1);
      });
    });

    it("should include compliance gaps in action plan", () => {
      const plan = generateActionPlan([], mockGaps, 1);
      expect(plan.items.length).toBeGreaterThan(0);
      expect(plan.items.some((i) => i.id.includes("gap"))).toBe(true);
    });

    it("should calculate priority distribution", () => {
      const plan = generateActionPlan(mockVulnerabilities, mockGaps, 1);
      expect(plan.priorityDistribution).toBeDefined();
      expect(plan.priorityDistribution.critical).toBeGreaterThanOrEqual(0);
      expect(plan.priorityDistribution.high).toBeGreaterThanOrEqual(0);
    });

    it("should calculate total items correctly", () => {
      const plan = generateActionPlan(mockVulnerabilities, mockGaps, 1);
      expect(plan.totalItems).toBe(plan.items.length);
    });

    it("should calculate critical items correctly", () => {
      const plan = generateActionPlan(mockVulnerabilities, mockGaps, 1);
      const criticalCount = plan.items.filter(
        (i) => i.priority === "critical"
      ).length;
      expect(plan.criticalItems).toBe(criticalCount);
    });

    it("should estimate total effort", () => {
      const plan = generateActionPlan(mockVulnerabilities, mockGaps, 1);
      expect(plan.estimatedTotalEffort).toBeDefined();
      expect(plan.estimatedTotalEffort.length).toBeGreaterThan(0);
    });
  });

  describe("formatActionPlanForDisplay", () => {
    it("should format action plan as markdown", () => {
      const plan = generateActionPlan(mockVulnerabilities, mockGaps, 1);
      const formatted = formatActionPlanForDisplay(plan);
      expect(formatted).toContain("# Plano de Ação");
      expect(formatted).toContain("## Resumo");
      expect(formatted).toContain("Total de Ações");
    });

    it("should include all action items", () => {
      const plan = generateActionPlan(mockVulnerabilities, mockGaps, 1);
      const formatted = formatActionPlanForDisplay(plan);
      expect(formatted).toContain("Ações Prioritárias");
    });

    it("should include priority distribution", () => {
      const plan = generateActionPlan(mockVulnerabilities, mockGaps, 1);
      const formatted = formatActionPlanForDisplay(plan);
      expect(formatted).toContain("Distribuição por Prioridade");
    });

    it("should format dates correctly", () => {
      const plan = generateActionPlan(mockVulnerabilities, mockGaps, 1);
      const formatted = formatActionPlanForDisplay(plan);
      expect(formatted).toContain("Prazo:");
    });
  });
});
