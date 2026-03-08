import { getVulnerabilitiesByScan, getScansByOrganization } from "../db";
import type { Vulnerability } from "../../drizzle/schema";

export interface ReportGenerationOptions {
  scanId: number;
  organizationId: number;
  format: "pdf" | "html" | "json";
  includeRecommendations?: boolean;
  includeActionPlan?: boolean;
}

export interface ActionItem {
  priority: "critical" | "high" | "medium" | "low";
  nis2Article: string;
  description: string;
  recommendation: string;
  estimatedEffort: "1-2h" | "3-8h" | "1-3d" | "1-2w" | "2w+";
  deadline: string;
  responsible?: string;
}

export interface ReportData {
  title: string;
  generatedAt: string;
  organizationName: string;
  scanId: number;
  targetRange: string;
  vulnerabilities: Vulnerability[];
  summary: {
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    complianceScore: number;
  };
  actionPlan?: ActionItem[];
  nis2Coverage?: {
    article: string;
    status: "compliant" | "non_compliant" | "partial";
    vulnerabilities: number;
  }[];
}

/**
 * Generate action items based on vulnerabilities
 */
export function generateActionPlan(vulnerabilities: Vulnerability[]): ActionItem[] {
  const actionItems: ActionItem[] = [];

  // Group vulnerabilities by severity
  const critical = vulnerabilities.filter((v) => v.severity === "critical");
  const high = vulnerabilities.filter((v) => v.severity === "high");
  const medium = vulnerabilities.filter((v) => v.severity === "medium");

  // Critical vulnerabilities - immediate action
  critical.forEach((vuln, index) => {
    actionItems.push({
      priority: "critical",
      nis2Article: "Art. 21 (Segurança de Sistemas)",
      description: `Vulnerabilidade crítica: ${vuln.title}`,
      recommendation: vuln.remediationDetails || "Aplicar patch de segurança imediatamente",
      estimatedEffort: "1-2h",
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 24 horas
      responsible: "Equipa de Segurança",
    });
  });

  // High vulnerabilities - urgent action (1 week)
  high.forEach((vuln) => {
    actionItems.push({
      priority: "high",
      nis2Article: "Art. 22 (Gestão de Riscos)",
      description: `Vulnerabilidade alta: ${vuln.title}`,
      recommendation: vuln.remediationDetails || "Implementar mitigação de risco",
      estimatedEffort: "3-8h",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 semana
      responsible: "Equipa de Infraestrutura",
    });
  });

  // Medium vulnerabilities - planned action (1 month)
  medium.slice(0, 5).forEach((vuln) => {
    actionItems.push({
      priority: "medium",
      nis2Article: "Art. 23 (Resposta a Incidentes)",
      description: `Vulnerabilidade média: ${vuln.title}`,
      recommendation: vuln.remediationDetails || "Agendar correção em próxima janela de manutenção",
      estimatedEffort: "1-3d",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 mês
      responsible: "Gestor de Projeto",
    });
  });

  return actionItems;
}

/**
 * Generate NIS2 coverage report
 */
export function generateNIS2Coverage(vulnerabilities: Vulnerability[]) {
  const articles = [
    { article: "Art. 21", label: "Segurança de Sistemas" },
    { article: "Art. 22", label: "Gestão de Riscos" },
    { article: "Art. 23", label: "Resposta a Incidentes" },
    { article: "Art. 24", label: "Continuidade de Negócio" },
    { article: "Art. 25", label: "Conformidade e Auditoria" },
  ];

  return articles.map((art) => ({
    article: art.article,
    label: art.label,
    status: vulnerabilities.length > 0 ? ("partial" as const) : ("compliant" as const),
    vulnerabilities: Math.floor(Math.random() * 5), // Placeholder
  }));
}

/**
 * Generate HTML report
 */
export function generateHTMLReport(data: ReportData): string {
  const criticalPercentage = (data.summary.criticalCount / data.summary.totalVulnerabilities) * 100;
  const highPercentage = (data.summary.highCount / data.summary.totalVulnerabilities) * 100;

  return `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
    .header { border-bottom: 3px solid #0891b2; padding-bottom: 30px; margin-bottom: 40px; }
    .header h1 { font-size: 32px; color: #0c4a6e; margin-bottom: 10px; }
    .header p { color: #666; font-size: 14px; }
    .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
    .meta-item { background: #f8fafc; padding: 15px; border-radius: 8px; }
    .meta-item label { display: block; font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
    .meta-item value { display: block; font-size: 16px; font-weight: 600; color: #0c4a6e; }
    .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin: 30px 0; }
    .summary-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-card.critical { background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); }
    .summary-card.high { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }
    .summary-card.medium { background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); }
    .summary-card.low { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }
    .summary-card h3 { font-size: 24px; margin-bottom: 5px; }
    .summary-card p { font-size: 12px; opacity: 0.9; }
    .section { margin: 40px 0; }
    .section h2 { font-size: 24px; color: #0c4a6e; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    .vulnerability { background: #f8fafc; border-left: 4px solid #f43f5e; padding: 15px; margin-bottom: 15px; border-radius: 4px; }
    .vulnerability.high { border-left-color: #f97316; }
    .vulnerability.medium { border-left-color: #eab308; }
    .vulnerability.low { border-left-color: #22c55e; }
    .vulnerability h4 { color: #0c4a6e; margin-bottom: 8px; }
    .vulnerability p { font-size: 14px; color: #666; margin-bottom: 5px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-right: 8px; }
    .badge.critical { background: #fee2e2; color: #991b1b; }
    .badge.high { background: #ffedd5; color: #92400e; }
    .badge.medium { background: #fef3c7; color: #92400e; }
    .badge.low { background: #dcfce7; color: #166534; }
    .action-plan { margin-top: 30px; }
    .action-item { background: white; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 15px; border-radius: 8px; }
    .action-item h4 { color: #0c4a6e; margin-bottom: 10px; }
    .action-item-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 13px; }
    .action-item-meta div { }
    .action-item-meta label { color: #666; font-weight: 600; }
    .action-item-meta value { color: #0c4a6e; margin-top: 3px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #666; font-size: 12px; }
    .compliance-score { font-size: 48px; font-weight: 700; color: #0c4a6e; }
    .score-label { font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${data.title}</h1>
      <p>Relatório de Conformidade NIS2 e Análise de Vulnerabilidades</p>
    </div>

    <div class="meta">
      <div class="meta-item">
        <label>Organização</label>
        <value>${data.organizationName}</value>
      </div>
      <div class="meta-item">
        <label>Data de Geração</label>
        <value>${new Date(data.generatedAt).toLocaleDateString("pt-PT")}</value>
      </div>
      <div class="meta-item">
        <label>ID do Scan</label>
        <value>#${data.scanId}</value>
      </div>
      <div class="meta-item">
        <label>Alvo</label>
        <value>${data.targetRange}</value>
      </div>
    </div>

    <div class="summary">
      <div class="summary-card">
        <div class="compliance-score">${data.summary.complianceScore}%</div>
        <p class="score-label">Score de Conformidade</p>
      </div>
      <div class="summary-card critical">
        <h3>${data.summary.criticalCount}</h3>
        <p>Críticas</p>
      </div>
      <div class="summary-card high">
        <h3>${data.summary.highCount}</h3>
        <p>Altas</p>
      </div>
      <div class="summary-card medium">
        <h3>${data.summary.mediumCount}</h3>
        <p>Médias</p>
      </div>
      <div class="summary-card low">
        <h3>${data.summary.lowCount}</h3>
        <p>Baixas</p>
      </div>
    </div>

    <div class="section">
      <h2>Vulnerabilidades Descobertas</h2>
      ${data.vulnerabilities
        .map(
          (vuln) => `
        <div class="vulnerability ${vuln.severity}">
          <h4>${vuln.title}</h4>
          <p><span class="badge ${vuln.severity}">${vuln.severity.toUpperCase()}</span> CVSS: ${vuln.cvssScore || "N/A"}</p>
          <p><strong>CVE:</strong> ${vuln.cveId}</p>
          <p><strong>Software Afetado:</strong> ${vuln.affectedSoftware || "N/A"} ${vuln.affectedVersion ? `(v${vuln.affectedVersion})` : ""}</p>
          ${vuln.remediationDetails ? `<p><strong>Remediação:</strong> ${vuln.remediationDetails}</p>` : ""}
        </div>
      `
        )
        .join("")}
    </div>

    ${
      data.actionPlan && data.actionPlan.length > 0
        ? `
    <div class="section action-plan">
      <h2>Plano de Ação Recomendado</h2>
      ${data.actionPlan
        .map(
          (action) => `
        <div class="action-item">
          <h4>${action.description}</h4>
          <p>${action.recommendation}</p>
          <div class="action-item-meta">
            <div>
              <label>Prioridade</label>
              <value><span class="badge ${action.priority}">${action.priority.toUpperCase()}</span></value>
            </div>
            <div>
              <label>Artigo NIS2</label>
              <value>${action.nis2Article}</value>
            </div>
            <div>
              <label>Prazo</label>
              <value>${action.deadline}</value>
            </div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
    `
        : ""
    }

    <div class="footer">
      <p>Este relatório foi gerado automaticamente pelo NIS2 Compliance Scanner</p>
      <p>Para mais informações, contacte a equipa de segurança</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate JSON report
 */
export function generateJSONReport(data: ReportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Generate report in specified format
 */
export async function generateReport(
  options: ReportGenerationOptions
): Promise<{ content: string; mimeType: string; filename: string }> {
  try {
    // Fetch vulnerabilities for the scan
    const vulnerabilities = await getVulnerabilitiesByScan(options.scanId);

    if (!vulnerabilities || vulnerabilities.length === 0) {
      throw new Error(`No vulnerabilities found for scan ${options.scanId}`);
    }

    // Calculate summary
    const summary = {
      totalVulnerabilities: vulnerabilities.length,
      criticalCount: vulnerabilities.filter((v) => v.severity === "critical").length,
      highCount: vulnerabilities.filter((v) => v.severity === "high").length,
      mediumCount: vulnerabilities.filter((v) => v.severity === "medium").length,
      lowCount: vulnerabilities.filter((v) => v.severity === "low").length,
      complianceScore: Math.max(0, 100 - vulnerabilities.length * 5), // Simple calculation
    };

    // Generate action plan if requested
    const actionPlan = options.includeActionPlan ? generateActionPlan(vulnerabilities) : undefined;

    // Generate NIS2 coverage if requested
    const nis2Coverage = options.includeRecommendations ? generateNIS2Coverage(vulnerabilities) : undefined;

    const reportData: ReportData = {
      title: `Relatório de Conformidade NIS2 - Scan #${options.scanId}`,
      generatedAt: new Date().toISOString(),
      organizationName: "Organização", // TODO: Fetch from database
      scanId: options.scanId,
      targetRange: "192.168.1.0/24", // TODO: Fetch from database
      vulnerabilities,
      summary,
      actionPlan,
      nis2Coverage,
    };

    let content: string;
    let mimeType: string;
    let filename: string;

    switch (options.format) {
      case "html":
        content = generateHTMLReport(reportData);
        mimeType = "text/html";
        filename = `relatorio-conformidade-nis2-scan-${options.scanId}.html`;
        break;

      case "json":
        content = generateJSONReport(reportData);
        mimeType = "application/json";
        filename = `relatorio-conformidade-nis2-scan-${options.scanId}.json`;
        break;

      case "pdf":
        // For PDF, we'll generate HTML and note that PDF conversion would be done client-side or via external service
        content = generateHTMLReport(reportData);
        mimeType = "text/html"; // Return HTML for now, client can convert to PDF
        filename = `relatorio-conformidade-nis2-scan-${options.scanId}.pdf`;
        break;

      default:
        throw new Error(`Unsupported report format: ${options.format}`);
    }

    console.log(`[ReportGenerator] Generated ${options.format} report for scan ${options.scanId}`);

    return { content, mimeType, filename };
  } catch (error) {
    console.error("[ReportGenerator] Error generating report:", error);
    throw error;
  }
}
