/**
 * Action Plan Generator Service
 * Generates detailed action plans with prazos and estimativas de esforço
 */

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedEffort: string; // e.g., "2-4 hours", "1-2 days", "1-2 weeks"
  deadline: string; // ISO date string
  relatedControls: string[]; // ISO 27001 controls
  relatedArticles: string[]; // NIS2 articles
  steps: string[];
  resources: string[];
  successCriteria: string[];
}

export interface ActionPlan {
  items: ActionItem[];
  totalItems: number;
  criticalItems: number;
  estimatedTotalEffort: string;
  priorityDistribution: Record<string, number>;
}

/**
 * Generate action plan from vulnerabilities and compliance gaps
 */
export function generateActionPlan(
  vulnerabilities: any[],
  complianceGaps: any[],
  organizationId: number
): ActionPlan {
  const items: ActionItem[] = [];
  const today = new Date();

  // Process critical vulnerabilities
  vulnerabilities
    .filter((v) => v.severity === "critical" || parseFloat(v.cvssScore || "0") >= 9)
    .forEach((vuln, index) => {
      items.push({
        id: `vuln-critical-${index}`,
        title: `Remediar Vulnerabilidade Crítica: ${vuln.cveId}`,
        description: `Resolver vulnerabilidade crítica ${vuln.cveId} em ${vuln.affectedSoftware || "sistema"}. CVSS Score: ${vuln.cvssScore}`,
        priority: "critical",
        estimatedEffort: "2-8 hours",
        deadline: addDays(today, 1).toISOString(), // 24 horas
        relatedControls: ["A.12.1", "A.12.6", "A.14.2"],
        relatedArticles: ["Art. 21", "Art. 22"],
        steps: [
          "Avaliar impacto da vulnerabilidade",
          "Desenvolver patch ou workaround",
          "Testar em ambiente de staging",
          "Implementar em produção",
          "Validar remediação",
          "Documentar mudanças",
        ],
        resources: [
          "Engenheiro de Segurança",
          "DevOps Engineer",
          "Ambiente de teste",
          "Ferramentas de scanning",
        ],
        successCriteria: [
          "Vulnerabilidade removida em scan posterior",
          "Sem impacto em serviços em produção",
          "Documentação atualizada",
        ],
      });
    });

  // Process high severity vulnerabilities
  vulnerabilities
    .filter((v) => v.severity === "high" && parseFloat(v.cvssScore || "0") < 9)
    .slice(0, 3)
    .forEach((vuln, index) => {
      items.push({
        id: `vuln-high-${index}`,
        title: `Remediar Vulnerabilidade Alta: ${vuln.cveId}`,
        description: `Resolver vulnerabilidade alta ${vuln.cveId}. CVSS Score: ${vuln.cvssScore}`,
        priority: "high",
        estimatedEffort: "4-16 hours",
        deadline: addDays(today, 7).toISOString(), // 1 semana
        relatedControls: ["A.12.1", "A.12.6"],
        relatedArticles: ["Art. 21", "Art. 22"],
        steps: [
          "Analisar vulnerabilidade",
          "Planejar remediação",
          "Implementar correção",
          "Testar e validar",
          "Deploy em produção",
        ],
        resources: ["Engenheiro de Segurança", "DevOps Engineer"],
        successCriteria: [
          "Vulnerabilidade resolvida",
          "Testes passando",
          "Documentação atualizada",
        ],
      });
    });

  // Process compliance gaps
  complianceGaps.slice(0, 5).forEach((gap, index) => {
    const priorityMap: Record<string, "critical" | "high" | "medium"> = {
      A_9_1: "critical", // Access Control
      A_9_2: "critical", // User Access Management
      A_12_1: "high", // Change Management
      A_14_2: "high", // Secure Development
      A_5_1: "medium", // Policies
    };

    const priority = priorityMap[gap.id?.replace(/\./g, "_")] || "medium";
    const daysToDeadline =
      priority === "critical" ? 14 : priority === "high" ? 30 : 60;

    items.push({
      id: `gap-${index}`,
      title: `Implementar Controlo: ${gap.id} - ${gap.name}`,
      description: gap.description || `Implementar controlo ISO 27001 ${gap.id}`,
      priority,
      estimatedEffort:
        priority === "critical"
          ? "1-2 weeks"
          : priority === "high"
            ? "2-4 weeks"
            : "1-2 months",
      deadline: addDays(today, daysToDeadline).toISOString(),
      relatedControls: [gap.id],
      relatedArticles: mapControlToNIS2Articles(gap.id),
      steps: [
        "Revisar requisitos do controlo",
        "Avaliar estado atual",
        "Desenvolver plano de implementação",
        "Implementar controlo",
        "Testar e validar",
        "Documentar evidência",
        "Obter aprovação",
      ],
      resources: [
        "Responsável de Segurança",
        "Equipa de TI",
        "Ferramentas de conformidade",
      ],
      successCriteria: [
        "Controlo totalmente implementado",
        "Evidência documentada",
        "Aprovado por auditor",
      ],
    });
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  items.sort(
    (a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  // Calculate statistics
  const criticalCount = items.filter((i) => i.priority === "critical").length;
  const priorityDist = {
    critical: items.filter((i) => i.priority === "critical").length,
    high: items.filter((i) => i.priority === "high").length,
    medium: items.filter((i) => i.priority === "medium").length,
    low: items.filter((i) => i.priority === "low").length,
  };

  const totalEffort = calculateTotalEffort(items);

  return {
    items,
    totalItems: items.length,
    criticalItems: criticalCount,
    estimatedTotalEffort: totalEffort,
    priorityDistribution: priorityDist,
  };
}

/**
 * Calculate total effort from all items
 */
function calculateTotalEffort(items: ActionItem[]): string {
  let totalHours = 0;

  items.forEach((item) => {
    const effort = item.estimatedEffort;

    if (effort.includes("hour")) {
      const match = effort.match(/(\d+)-(\d+)/);
      if (match) {
        totalHours += (parseInt(match[1]) + parseInt(match[2])) / 2;
      }
    } else if (effort.includes("day")) {
      const match = effort.match(/(\d+)-(\d+)/);
      if (match) {
        totalHours += ((parseInt(match[1]) + parseInt(match[2])) / 2) * 8;
      }
    } else if (effort.includes("week")) {
      const match = effort.match(/(\d+)-(\d+)/);
      if (match) {
        totalHours += ((parseInt(match[1]) + parseInt(match[2])) / 2) * 40;
      }
    } else if (effort.includes("month")) {
      const match = effort.match(/(\d+)-(\d+)/);
      if (match) {
        totalHours += ((parseInt(match[1]) + parseInt(match[2])) / 2) * 160;
      }
    }
  });

  if (totalHours < 8) {
    return `${Math.round(totalHours)} horas`;
  } else if (totalHours < 40) {
    const days = Math.round(totalHours / 8);
    return `${days} dias`;
  } else if (totalHours < 160) {
    const weeks = Math.round(totalHours / 40);
    return `${weeks} semanas`;
  } else {
    const months = Math.round(totalHours / 160);
    return `${months} meses`;
  }
}

/**
 * Map ISO 27001 control to NIS2 articles
 */
function mapControlToNIS2Articles(controlId: string): string[] {
  const mappings: Record<string, string[]> = {
    "A.5.1": ["Art. 21", "Art. 25"],
    "A.5.2": ["Art. 21"],
    "A.6.1": ["Art. 21"],
    "A.6.2": ["Art. 21"],
    "A.9.1": ["Art. 21", "Art. 22"],
    "A.9.2": ["Art. 21", "Art. 22"],
    "A.9.3": ["Art. 21", "Art. 22"],
    "A.9.4": ["Art. 21", "Art. 22"],
    "A.12.1": ["Art. 21", "Art. 22"],
    "A.12.2": ["Art. 21"],
    "A.12.6": ["Art. 21", "Art. 22"],
    "A.14.1": ["Art. 21"],
    "A.14.2": ["Art. 21", "Art. 22"],
    "A.16.1": ["Art. 23", "Art. 24"],
  };

  return mappings[controlId] || ["Art. 21"];
}

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format action plan for display
 */
export function formatActionPlanForDisplay(plan: ActionPlan): string {
  let output = `# Plano de Ação de Conformidade\n\n`;

  output += `## Resumo\n`;
  output += `- Total de Ações: ${plan.totalItems}\n`;
  output += `- Ações Críticas: ${plan.criticalItems}\n`;
  output += `- Esforço Total Estimado: ${plan.estimatedTotalEffort}\n\n`;

  output += `## Distribuição por Prioridade\n`;
  Object.entries(plan.priorityDistribution).forEach(([priority, count]) => {
    output += `- ${priority.toUpperCase()}: ${count} ações\n`;
  });

  output += `\n## Ações Prioritárias\n\n`;

  plan.items.slice(0, 10).forEach((item, index) => {
    output += `### ${index + 1}. ${item.title}\n`;
    output += `**Prioridade:** ${item.priority.toUpperCase()}\n`;
    output += `**Prazo:** ${new Date(item.deadline).toLocaleDateString("pt-PT")}\n`;
    output += `**Esforço Estimado:** ${item.estimatedEffort}\n`;
    output += `**Descrição:** ${item.description}\n\n`;

    output += `**Passos:**\n`;
    item.steps.forEach((step) => {
      output += `- ${step}\n`;
    });

    output += `\n**Recursos Necessários:**\n`;
    item.resources.forEach((resource) => {
      output += `- ${resource}\n`;
    });

    output += `\n**Critérios de Sucesso:**\n`;
    item.successCriteria.forEach((criteria) => {
      output += `- ${criteria}\n`;
    });

    output += `\n---\n\n`;
  });

  return output;
}
