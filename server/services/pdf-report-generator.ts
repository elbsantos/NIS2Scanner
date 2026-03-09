/**
 * PDF Report Generator Service
 * Generates executive and technical reports with compliance metrics and action plans
 */

import PDFDocument from "pdfkit";
import { Readable } from "stream";

export interface ComplianceMetrics {
  nis2Score: number;
  iso27001Score: number;
  mitreAttackCoverage: number;
  overallRiskScore: number;
  vulnerabilityCount: number;
  criticalVulnerabilities: number;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedEffort: string; // e.g., "2-4 hours", "1-2 days"
  deadline: string;
  relatedControls: string[];
  relatedArticles: string[];
  steps: string[];
  resources: string[];
}

export interface ActionPlan {
  items: ActionItem[];
  totalItems: number;
  criticalItems: number;
  estimatedTotalEffort: string;
  priorityDistribution: Record<string, number>;
}

export interface ReportData {
  organizationName: string;
  reportDate: string;
  metrics: ComplianceMetrics;
  actionPlan: ActionPlan;
  vulnerabilities: any[];
  recommendations: string[];
  complianceByDomain: Record<string, number>;
  riskByTactic: Record<string, number>;
}

/**
 * Generate Executive Report PDF
 */
export async function generateExecutiveReportPDF(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Title Page
      doc.fontSize(28).font("Helvetica-Bold").text("Relatório de Conformidade NIS2", {
        align: "center",
      });

      doc.moveDown(0.5);
      doc.fontSize(14).font("Helvetica").text("Análise Executiva", {
        align: "center",
      });

      doc.moveDown(1);
      doc.fontSize(11).text(`Organização: ${data.organizationName}`, {
        align: "left",
      });
      doc.text(`Data do Relatório: ${data.reportDate}`, {
        align: "left",
      });

      // Executive Summary
      doc.addPage();
      doc.fontSize(18).font("Helvetica-Bold").text("Resumo Executivo", {
        underline: true,
      });
      doc.moveDown(0.5);

      doc.fontSize(11).font("Helvetica");

      // Key Metrics
      doc.fontSize(14).font("Helvetica-Bold").text("Métricas Principais", {
        underline: true,
      });
      doc.moveDown(0.3);

      const metricsTable = [
        ["Métrica", "Score", "Status"],
        [
          "Conformidade NIS2",
          `${data.metrics.nis2Score}%`,
          getStatusBadge(data.metrics.nis2Score),
        ],
        [
          "Conformidade ISO 27001",
          `${data.metrics.iso27001Score}%`,
          getStatusBadge(data.metrics.iso27001Score),
        ],
        [
          "Cobertura MITRE ATT&CK",
          `${data.metrics.mitreAttackCoverage}%`,
          getStatusBadge(data.metrics.mitreAttackCoverage),
        ],
        [
          "Score de Risco Geral",
          `${data.metrics.overallRiskScore.toFixed(1)}/10`,
          getRiskStatusBadge(data.metrics.overallRiskScore),
        ],
      ];

      drawTable(doc, metricsTable, 50, doc.y, {
        width: 500,
        rowHeight: 25,
      });

      doc.moveDown(1);

      // Vulnerabilities Summary
      doc.fontSize(14).font("Helvetica-Bold").text("Vulnerabilidades Descobertas", {
        underline: true,
      });
      doc.moveDown(0.3);

      doc.fontSize(11).font("Helvetica");
      doc.text(`Total de Vulnerabilidades: ${data.metrics.vulnerabilityCount}`, {
        indent: 20,
      });
      doc.text(
        `Vulnerabilidades Críticas: ${data.metrics.criticalVulnerabilities}`,
        {
          indent: 20,
        }
      );
      doc.text(
        `Ação Imediata Necessária: ${data.metrics.criticalVulnerabilities > 0 ? "SIM" : "NÃO"}`,
        {
          indent: 20,
        }
      );

      doc.moveDown(1);

      // Top Recommendations
      doc.fontSize(14).font("Helvetica-Bold").text("Recomendações Prioritárias", {
        underline: true,
      });
      doc.moveDown(0.3);

      doc.fontSize(11).font("Helvetica");
      data.recommendations.slice(0, 5).forEach((rec, index) => {
        doc.text(`${index + 1}. ${rec}`, {
          indent: 20,
          width: 450,
        });
        doc.moveDown(0.3);
      });

      // Action Plan Summary
      doc.addPage();
      doc.fontSize(18).font("Helvetica-Bold").text("Plano de Ação", {
        underline: true,
      });
      doc.moveDown(0.5);

      doc.fontSize(11).font("Helvetica");
      doc.text(
        `Total de Ações: ${data.actionPlan.totalItems}`,
        { indent: 20 }
      );
      doc.text(
        `Ações Críticas: ${data.actionPlan.criticalItems}`,
        { indent: 20 }
      );
      doc.text(
        `Esforço Total Estimado: ${data.actionPlan.estimatedTotalEffort}`,
        { indent: 20 }
      );

      doc.moveDown(0.5);

      // Priority Distribution
      doc.fontSize(12).font("Helvetica-Bold").text("Distribuição por Prioridade", {
        underline: true,
      });
      doc.moveDown(0.3);

      Object.entries(data.actionPlan.priorityDistribution).forEach(
        ([priority, count]) => {
          doc.text(`${priority.toUpperCase()}: ${count} ações`, {
            indent: 20,
          });
        }
      );

      doc.moveDown(1);

      // Top Action Items
      doc.fontSize(12).font("Helvetica-Bold").text("Ações Prioritárias (Top 5)", {
        underline: true,
      });
      doc.moveDown(0.3);

      data.actionPlan.items.slice(0, 5).forEach((item, index) => {
        doc.fontSize(10).font("Helvetica-Bold").text(`${index + 1}. ${item.title}`, {
          indent: 20,
        });
        doc.fontSize(9).font("Helvetica");
        doc.text(`Prioridade: ${item.priority.toUpperCase()}`, {
          indent: 30,
        });
        doc.text(`Prazo: ${item.deadline}`, {
          indent: 30,
        });
        doc.text(`Esforço Estimado: ${item.estimatedEffort}`, {
          indent: 30,
        });
        doc.text(`Controlos Relacionados: ${item.relatedControls.join(", ")}`, {
          indent: 30,
          width: 430,
        });
        doc.moveDown(0.2);
      });

      // Compliance by Domain
      doc.addPage();
      doc.fontSize(18).font("Helvetica-Bold").text("Conformidade por Domínio", {
        underline: true,
      });
      doc.moveDown(0.5);

      const domainTable = [
        ["Domínio", "Conformidade", "Status"],
        ...Object.entries(data.complianceByDomain).map(([domain, score]) => [
          domain,
          `${score}%`,
          getStatusBadge(score),
        ]),
      ];

      drawTable(doc, domainTable, 50, doc.y, {
        width: 500,
        rowHeight: 25,
      });

      // Risk by Tactic
      doc.moveDown(1);
      doc.fontSize(14).font("Helvetica-Bold").text("Risco por Tática MITRE ATT&CK", {
        underline: true,
      });
      doc.moveDown(0.3);

      const tacticTable = [
        ["Tática", "Risco", "Status"],
        ...Object.entries(data.riskByTactic)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([tactic, risk]) => [
            tactic,
            `${(risk * 100).toFixed(0)}%`,
            getRiskStatusBadge(risk * 10),
          ]),
      ];

      drawTable(doc, tacticTable, 50, doc.y, {
        width: 500,
        rowHeight: 25,
      });

      // Footer
      doc.fontSize(9).font("Helvetica").text(
        "Este relatório é confidencial e destinado apenas aos destinatários autorizados.",
        {
          align: "center",
        }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate Technical Report PDF
 */
export async function generateTechnicalReportPDF(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Title
      doc.fontSize(28).font("Helvetica-Bold").text("Relatório Técnico de Conformidade", {
        align: "center",
      });

      doc.moveDown(0.5);
      doc.fontSize(14).font("Helvetica").text("NIS2 + ISO 27001 + MITRE ATT&CK", {
        align: "center",
      });

      doc.moveDown(1);
      doc.fontSize(11).text(`Organização: ${data.organizationName}`, {
        align: "left",
      });
      doc.text(`Data: ${data.reportDate}`, {
        align: "left",
      });

      // Vulnerabilities Detail
      doc.addPage();
      doc.fontSize(18).font("Helvetica-Bold").text("Vulnerabilidades Detalhadas", {
        underline: true,
      });
      doc.moveDown(0.5);

      const vulnTable = [
        ["CVE", "Severidade", "CVSS", "Artigos NIS2", "Controlos ISO"],
        ...data.vulnerabilities.slice(0, 10).map((v) => [
          v.cveId || "N/A",
          v.severity || "N/A",
          v.cvssScore || "N/A",
          v.nis2Articles?.join(", ") || "N/A",
          v.isoControls?.join(", ") || "N/A",
        ]),
      ];

      drawTable(doc, vulnTable, 50, doc.y, {
        width: 500,
        rowHeight: 20,
      });

      // Detailed Action Plan
      doc.addPage();
      doc.fontSize(18).font("Helvetica-Bold").text("Plano de Ação Detalhado", {
        underline: true,
      });
      doc.moveDown(0.5);

      data.actionPlan.items.forEach((item, index) => {
        doc.fontSize(12).font("Helvetica-Bold").text(`${index + 1}. ${item.title}`, {
          underline: true,
        });
        doc.moveDown(0.2);

        doc.fontSize(10).font("Helvetica");
        doc.text(`Descrição: ${item.description}`, {
          indent: 20,
          width: 430,
        });
        doc.text(`Prioridade: ${item.priority.toUpperCase()}`, {
          indent: 20,
        });
        doc.text(`Prazo: ${item.deadline}`, {
          indent: 20,
        });
        doc.text(`Esforço Estimado: ${item.estimatedEffort}`, {
          indent: 20,
        });

        doc.text(`Artigos NIS2 Relacionados: ${item.relatedArticles.join(", ")}`, {
          indent: 20,
          width: 430,
        });
        doc.text(`Controlos ISO 27001: ${item.relatedControls.join(", ")}`, {
          indent: 20,
          width: 430,
        });

        doc.moveDown(0.2);
        doc.fontSize(9).font("Helvetica-Bold").text("Passos de Implementação:", {
          indent: 20,
        });
        item.steps.forEach((step) => {
          doc.fontSize(9).text(`• ${step}`, {
            indent: 30,
            width: 420,
          });
        });

        doc.moveDown(0.2);
        doc.fontSize(9).font("Helvetica-Bold").text("Recursos Necessários:", {
          indent: 20,
        });
        item.resources.forEach((resource) => {
          doc.fontSize(9).text(`• ${resource}`, {
            indent: 30,
            width: 420,
          });
        });

        doc.moveDown(0.5);
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Helper function to draw table
 */
function drawTable(
  doc: any,
  data: string[][],
  x: number,
  y: number,
  options: any
) {
  const { width, rowHeight } = options;
  const cellWidth = width / data[0].length;

  let currentY = y;

  data.forEach((row, rowIndex) => {
    let currentX = x;

    row.forEach((cell, cellIndex) => {
      // Draw cell border
      doc.rect(currentX, currentY, cellWidth, rowHeight).stroke();

      // Draw text
      const isHeader = rowIndex === 0;
      doc.fontSize(isHeader ? 10 : 9);
      doc.font(isHeader ? "Helvetica-Bold" : "Helvetica");

      doc.text(cell, currentX + 5, currentY + 5, {
        width: cellWidth - 10,
        height: rowHeight - 10,
        align: "left",
        valign: "center",
      });

      currentX += cellWidth;
    });

    currentY += rowHeight;
  });

  return currentY;
}

/**
 * Get status badge text based on score
 */
function getStatusBadge(score: number): string {
  if (score >= 80) return "✓ Compliant";
  if (score >= 50) return "⚠ Partial";
  return "✗ Non-Compliant";
}

/**
 * Get risk status badge based on score
 */
function getRiskStatusBadge(score: number): string {
  if (score >= 8) return "🔴 Critical";
  if (score >= 6) return "🟠 High";
  if (score >= 4) return "🟡 Medium";
  return "🟢 Low";
}

/**
 * Generate full compliance report with both executive and technical sections
 */
export async function generateFullComplianceReportPDF(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Cover Page
      doc.fontSize(32).font("Helvetica-Bold").text("RELATÓRIO DE CONFORMIDADE", {
        align: "center",
      });
      doc.moveDown(0.5);
      doc.fontSize(20).font("Helvetica").text("NIS2 + ISO 27001 + MITRE ATT&CK", {
        align: "center",
      });

      doc.moveDown(2);
      doc.fontSize(14).font("Helvetica").text(`${data.organizationName}`, {
        align: "center",
      });
      doc.text(`${data.reportDate}`, {
        align: "center",
      });

      doc.moveDown(3);

      // Quick Stats
      doc.fontSize(12).font("Helvetica-Bold").text("Indicadores Principais", {
        align: "center",
        underline: true,
      });
      doc.moveDown(0.5);

      doc.fontSize(11).font("Helvetica");
      doc.text(`Conformidade NIS2: ${data.metrics.nis2Score}%`, {
        align: "center",
      });
      doc.text(`Conformidade ISO 27001: ${data.metrics.iso27001Score}%`, {
        align: "center",
      });
      doc.text(`Score de Risco: ${data.metrics.overallRiskScore.toFixed(1)}/10`, {
        align: "center",
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
