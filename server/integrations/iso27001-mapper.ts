/**
 * ISO 27001 Controls Mapper
 * Maps vulnerabilities to ISO 27001 controls and domains
 */

export interface ISO27001Domain {
  code: string;
  name: string;
  description: string;
  controlCount: number;
  category: "Organizational" | "People" | "Physical" | "Technical";
}

export interface ISO27001Control {
  id: string;
  domain: string;
  code: string;
  name: string;
  description: string;
  controlObjective: string;
  implementationGuidance: string;
  category: string;
}

export interface ComplianceStatus {
  domain: string;
  implementedControls: number;
  totalControls: number;
  compliancePercentage: number;
  status: "compliant" | "partial" | "non_compliant";
}

/**
 * ISO 27001:2022 - 14 Domains with 93 Controls
 */
export const ISO27001_DOMAINS: ISO27001Domain[] = [
  {
    code: "A.5",
    name: "Organizational Controls",
    description: "Controlos organizacionais para gestão de segurança da informação",
    controlCount: 10,
    category: "Organizational",
  },
  {
    code: "A.6",
    name: "People Controls",
    description: "Controlos relacionados com pessoas e recursos humanos",
    controlCount: 8,
    category: "People",
  },
  {
    code: "A.7",
    name: "Physical Controls",
    description: "Controlos físicos para proteção de ativos",
    controlCount: 15,
    category: "Physical",
  },
  {
    code: "A.8",
    name: "Cyber-Physical and Environmental Controls",
    description: "Controlos ciber-físicos e ambientais",
    controlCount: 10,
    category: "Physical",
  },
  {
    code: "A.9",
    name: "Technical Controls",
    description: "Controlos técnicos para segurança de sistemas",
    controlCount: 32,
    category: "Technical",
  },
  {
    code: "A.10",
    name: "Cryptography Controls",
    description: "Controlos de criptografia",
    controlCount: 2,
    category: "Technical",
  },
  {
    code: "A.11",
    name: "Physical and Environmental Security",
    description: "Segurança física e ambiental",
    controlCount: 2,
    category: "Physical",
  },
  {
    code: "A.12",
    name: "Operations Security",
    description: "Segurança operacional",
    controlCount: 14,
    category: "Technical",
  },
  {
    code: "A.13",
    name: "Communications Security",
    description: "Segurança de comunicações",
    controlCount: 4,
    category: "Technical",
  },
  {
    code: "A.14",
    name: "System Acquisition, Development and Maintenance",
    description: "Aquisição, desenvolvimento e manutenção de sistemas",
    controlCount: 13,
    category: "Technical",
  },
  {
    code: "A.15",
    name: "Supplier Relationships",
    description: "Relacionamento com fornecedores",
    controlCount: 3,
    category: "Organizational",
  },
  {
    code: "A.16",
    name: "Information Security Incident Management",
    description: "Gestão de incidentes de segurança da informação",
    controlCount: 7,
    category: "Organizational",
  },
  {
    code: "A.17",
    name: "Business Continuity Management",
    description: "Gestão de continuidade de negócio",
    controlCount: 6,
    category: "Organizational",
  },
  {
    code: "A.18",
    name: "Compliance",
    description: "Conformidade com requisitos legais e regulatórios",
    controlCount: 8,
    category: "Organizational",
  },
];

/**
 * Sample ISO 27001 Controls (representative subset)
 */
export const ISO27001_CONTROLS: ISO27001Control[] = [
  // A.5 - Organizational Controls
  {
    id: "A.5.1",
    domain: "A.5",
    code: "A.5.1",
    name: "Policies for Information Security",
    description: "Políticas para segurança da informação",
    controlObjective: "Estabelecer políticas de segurança da informação",
    implementationGuidance:
      "Desenvolver e comunicar políticas de segurança da informação",
    category: "Organizational",
  },
  {
    id: "A.5.2",
    domain: "A.5",
    code: "A.5.2",
    name: "Information Security Roles and Responsibilities",
    description: "Papéis e responsabilidades de segurança da informação",
    controlObjective: "Definir papéis e responsabilidades",
    implementationGuidance:
      "Atribuir responsabilidades de segurança da informação",
    category: "Organizational",
  },

  // A.6 - People Controls
  {
    id: "A.6.1",
    domain: "A.6",
    code: "A.6.1",
    name: "Screening",
    description: "Triagem de pessoal",
    controlObjective: "Verificar antecedentes de pessoal",
    implementationGuidance:
      "Realizar verificações de antecedentes apropriadas",
    category: "People",
  },
  {
    id: "A.6.2",
    domain: "A.6",
    code: "A.6.2",
    name: "Terms and Conditions of Employment",
    description: "Termos e condições de emprego",
    controlObjective: "Incluir responsabilidades de segurança nos contratos",
    implementationGuidance:
      "Incluir cláusulas de segurança em contratos de emprego",
    category: "People",
  },

  // A.9 - Technical Controls (sample)
  {
    id: "A.9.1",
    domain: "A.9",
    code: "A.9.1",
    name: "Access Control",
    description: "Controlo de acesso",
    controlObjective: "Limitar acesso a informações e sistemas",
    implementationGuidance:
      "Implementar controlo de acesso baseado em princípio de menor privilégio",
    category: "Technical",
  },
  {
    id: "A.9.2",
    domain: "A.9",
    code: "A.9.2",
    name: "User Access Management",
    description: "Gestão de acesso de utilizadores",
    controlObjective: "Gerenciar acesso de utilizadores",
    implementationGuidance:
      "Implementar processos de concessão, modificação e revogação de acesso",
    category: "Technical",
  },
  {
    id: "A.9.3",
    domain: "A.9",
    code: "A.9.3",
    name: "Password Management",
    description: "Gestão de palavras-passe",
    controlObjective: "Garantir palavras-passe seguras",
    implementationGuidance:
      "Implementar política de palavras-passe fortes e autenticação multifator",
    category: "Technical",
  },
  {
    id: "A.9.4",
    domain: "A.9",
    code: "A.9.4",
    name: "Privileged Access Rights",
    description: "Direitos de acesso privilegiado",
    controlObjective: "Restringir acesso privilegiado",
    implementationGuidance:
      "Implementar gestão de acesso privilegiado (PAM)",
    category: "Technical",
  },

  // A.12 - Operations Security
  {
    id: "A.12.1",
    domain: "A.12",
    code: "A.12.1",
    name: "Change Management",
    description: "Gestão de mudanças",
    controlObjective: "Controlar mudanças em sistemas",
    implementationGuidance:
      "Implementar processo formal de gestão de mudanças",
    category: "Technical",
  },
  {
    id: "A.12.2",
    domain: "A.12",
    code: "A.12.2",
    name: "Capacity Management",
    description: "Gestão de capacidade",
    controlObjective: "Monitorar e gerir capacidade de recursos",
    implementationGuidance:
      "Implementar monitoramento de capacidade e performance",
    category: "Technical",
  },

  // A.14 - System Development and Maintenance
  {
    id: "A.14.1",
    domain: "A.14",
    code: "A.14.1",
    name: "Information Security Requirements",
    description: "Requisitos de segurança da informação",
    controlObjective: "Incluir segurança no desenvolvimento",
    implementationGuidance:
      "Incluir requisitos de segurança em especificações",
    category: "Technical",
  },
  {
    id: "A.14.2",
    domain: "A.14",
    code: "A.14.2",
    name: "Secure Development Policy",
    description: "Política de desenvolvimento seguro",
    controlObjective: "Implementar desenvolvimento seguro",
    implementationGuidance:
      "Usar práticas de desenvolvimento seguro (SSDLC)",
    category: "Technical",
  },

  // A.16 - Incident Management
  {
    id: "A.16.1",
    domain: "A.16",
    code: "A.16.1",
    name: "Incident Management Planning and Preparation",
    description: "Planeamento e preparação de gestão de incidentes",
    controlObjective: "Preparar-se para incidentes de segurança",
    implementationGuidance:
      "Desenvolver plano de resposta a incidentes",
    category: "Organizational",
  },
];

/**
 * Get all ISO 27001 domains
 */
export function getISO27001Domains(): ISO27001Domain[] {
  return ISO27001_DOMAINS;
}

/**
 * Get controls for a specific domain
 */
export function getControlsByDomain(domainCode: string): ISO27001Control[] {
  return ISO27001_CONTROLS.filter((c) => c.domain === domainCode);
}

/**
 * Map vulnerability to relevant ISO 27001 controls
 */
export function mapVulnerabilityToControls(
  vulnerability: any
): { controlId: string; relevance: "critical" | "high" | "medium" | "low" }[] {
  const mappings: {
    controlId: string;
    relevance: "critical" | "high" | "medium" | "low";
  }[] = [];

  const severity = vulnerability.severity?.toLowerCase() || "medium";
  const title = vulnerability.title?.toLowerCase() || "";
  const cvssScore = parseFloat(vulnerability.cvssScore || "0");

  // Map based on vulnerability type
  if (title.includes("sql injection") || title.includes("injection")) {
    mappings.push(
      { controlId: "A.14.2", relevance: "critical" }, // Secure development
      { controlId: "A.9.1", relevance: "high" }, // Access control
      { controlId: "A.12.1", relevance: "high" } // Change management
    );
  }

  if (title.includes("xss") || title.includes("cross-site")) {
    mappings.push(
      { controlId: "A.14.2", relevance: "critical" },
      { controlId: "A.9.1", relevance: "high" }
    );
  }

  if (title.includes("ssl") || title.includes("tls") || title.includes("encryption")) {
    mappings.push(
      { controlId: "A.10.1", relevance: "critical" }, // Cryptography
      { controlId: "A.13.1", relevance: "high" } // Communications security
    );
  }

  if (title.includes("authentication") || title.includes("password")) {
    mappings.push(
      { controlId: "A.9.2", relevance: "critical" }, // User access management
      { controlId: "A.9.3", relevance: "critical" }, // Password management
      { controlId: "A.9.4", relevance: "high" } // Privileged access
    );
  }

  if (title.includes("privilege") || title.includes("escalation")) {
    mappings.push(
      { controlId: "A.9.4", relevance: "critical" },
      { controlId: "A.9.1", relevance: "high" }
    );
  }

  if (title.includes("patch") || title.includes("update") || title.includes("outdated")) {
    mappings.push(
      { controlId: "A.12.1", relevance: "critical" }, // Change management
      { controlId: "A.12.6", relevance: "high" } // Patch management
    );
  }

  // If no specific mapping, use generic ones based on severity
  if (mappings.length === 0) {
    if (severity === "critical" || cvssScore >= 9) {
      mappings.push(
        { controlId: "A.9.1", relevance: "critical" },
        { controlId: "A.12.1", relevance: "high" },
        { controlId: "A.16.1", relevance: "high" }
      );
    } else if (severity === "high" || cvssScore >= 7) {
      mappings.push(
        { controlId: "A.9.1", relevance: "high" },
        { controlId: "A.12.1", relevance: "medium" }
      );
    } else {
      mappings.push({ controlId: "A.9.1", relevance: "medium" });
    }
  }

  return mappings;
}

/**
 * Calculate ISO 27001 compliance status
 */
export function calculateComplianceStatus(
  implementedControls: string[],
  totalControls: number = ISO27001_CONTROLS.length
): ComplianceStatus[] {
  const statusByDomain: Record<string, ComplianceStatus> = {};

  // Initialize domains
  ISO27001_DOMAINS.forEach((domain) => {
    const domainControls = ISO27001_CONTROLS.filter(
      (c) => c.domain === domain.code
    );
    const implemented = domainControls.filter((c) =>
      implementedControls.includes(c.id)
    ).length;

    const compliancePercentage = domainControls.length > 0 ? (implemented / domainControls.length) * 100 : 0;

    const status: ComplianceStatus = {
      domain: domain.code,
      implementedControls: implemented,
      totalControls: domainControls.length,
      compliancePercentage: isNaN(compliancePercentage) ? 0 : Math.round(compliancePercentage),
      status:
        compliancePercentage >= 80
          ? "compliant"
          : compliancePercentage >= 50
            ? "partial"
            : "non_compliant",
    };
    statusByDomain[domain.code] = status;
  });

  return Object.values(statusByDomain);
}

/**
 * Get compliance gaps - controls that need implementation
 */
export function getComplianceGaps(
  implementedControls: string[]
): ISO27001Control[] {
  return ISO27001_CONTROLS.filter((c) => !implementedControls.includes(c.id));
}

/**
 * Generate ISO 27001 compliance report
 */
export function generateISO27001Report(
  vulnerabilities: any[],
  implementedControls: string[]
): {
  overallCompliance: number;
  statusByDomain: ComplianceStatus[];
  gaps: ISO27001Control[];
  vulnerabilityMappings: Record<string, any[]>;
  recommendations: string[];
} {
  const statusByDomain = calculateComplianceStatus(implementedControls);
  const gaps = getComplianceGaps(implementedControls);

  // Calculate overall compliance
  const overallCompliance = Math.round(
    statusByDomain.reduce((sum, s) => sum + s.compliancePercentage, 0) /
      statusByDomain.length
  );

  // Map vulnerabilities to controls
  const vulnerabilityMappings: Record<string, any[]> = {};
  vulnerabilities.forEach((vuln) => {
    const mappings = mapVulnerabilityToControls(vuln);
    vulnerabilityMappings[vuln.cveId] = mappings;
  });

  // Generate recommendations
  const recommendations: string[] = [];
  gaps.slice(0, 5).forEach((gap) => {
    recommendations.push(
      `Implementar controlo ${gap.id}: ${gap.name} - ${gap.implementationGuidance}`
    );
  });

  return {
    overallCompliance,
    statusByDomain,
    gaps,
    vulnerabilityMappings,
    recommendations,
  };
}
