/**
 * MITRE ATT&CK Framework Integration
 * Maps CVEs to MITRE ATT&CK techniques and tactics
 */

export interface MitreAttackTactic {
  id: string;
  name: string;
  description: string;
  techniques: number;
}

export interface MitreAttackTechnique {
  id: string;
  name: string;
  tactic: string;
  description: string;
  platforms: string[];
  detectionMethods: string[];
  mitigations: string[];
}

export interface CVEMitreMapping {
  cveId: string;
  techniques: {
    id: string;
    name: string;
    tactic: string;
    confidence: number;
  }[];
}

/**
 * MITRE ATT&CK Tactics (14 principais)
 */
export const MITRE_TACTICS: MitreAttackTactic[] = [
  {
    id: "TA0043",
    name: "Reconnaissance",
    description: "Técnicas usadas para reunir informações sobre o alvo",
    techniques: 10,
  },
  {
    id: "TA0042",
    name: "Resource Development",
    description: "Estabelecer recursos para conduzir operações",
    techniques: 7,
  },
  {
    id: "TA0001",
    name: "Initial Access",
    description: "Técnicas para obter acesso inicial ao sistema",
    techniques: 9,
  },
  {
    id: "TA0002",
    name: "Execution",
    description: "Executar código malicioso no sistema",
    techniques: 14,
  },
  {
    id: "TA0003",
    name: "Persistence",
    description: "Manter acesso ao sistema",
    techniques: 19,
  },
  {
    id: "TA0004",
    name: "Privilege Escalation",
    description: "Obter privilégios elevados",
    techniques: 13,
  },
  {
    id: "TA0005",
    name: "Defense Evasion",
    description: "Evitar detecção",
    techniques: 40,
  },
  {
    id: "TA0006",
    name: "Credential Access",
    description: "Obter credenciais",
    techniques: 17,
  },
  {
    id: "TA0007",
    name: "Discovery",
    description: "Explorar o ambiente",
    techniques: 30,
  },
  {
    id: "TA0008",
    name: "Lateral Movement",
    description: "Mover-se através da rede",
    techniques: 9,
  },
  {
    id: "TA0009",
    name: "Collection",
    description: "Reunir dados",
    techniques: 17,
  },
  {
    id: "TA0010",
    name: "Exfiltration",
    description: "Roubar dados",
    techniques: 9,
  },
  {
    id: "TA0011",
    name: "Command and Control",
    description: "Comunicação com sistemas comprometidos",
    techniques: 16,
  },
  {
    id: "TA0040",
    name: "Impact",
    description: "Impacto nos sistemas ou dados",
    techniques: 13,
  },
];

/**
 * Mapeamento de CVEs comuns para técnicas MITRE ATT&CK
 * Este é um exemplo simplificado - em produção, seria integrado com MITRE ATT&CK API
 */
export const CVE_MITRE_MAPPINGS: Record<string, CVEMitreMapping> = {
  "CVE-2024-1234": {
    cveId: "CVE-2024-1234",
    techniques: [
      {
        id: "T1190",
        name: "Exploit Public-Facing Application",
        tactic: "Initial Access",
        confidence: 0.95,
      },
      {
        id: "T1190",
        name: "SQL Injection",
        tactic: "Execution",
        confidence: 0.9,
      },
    ],
  },
  "CVE-2024-5678": {
    cveId: "CVE-2024-5678",
    techniques: [
      {
        id: "T1059",
        name: "Command and Scripting Interpreter",
        tactic: "Execution",
        confidence: 0.88,
      },
      {
        id: "T1047",
        name: "Windows Management Instrumentation",
        tactic: "Execution",
        confidence: 0.85,
      },
    ],
  },
};

/**
 * Get MITRE ATT&CK tactics
 */
export function getMitreTactics(): MitreAttackTactic[] {
  return MITRE_TACTICS;
}

/**
 * Get MITRE ATT&CK techniques by tactic
 */
export function getTechniquesByTactic(tactic: string): MitreAttackTactic[] {
  return MITRE_TACTICS.filter((t) => t.name.toLowerCase() === tactic.toLowerCase());
}

/**
 * Map CVE to MITRE ATT&CK techniques
 */
export function mapCVEToMitre(cveId: string): CVEMitreMapping | null {
  return CVE_MITRE_MAPPINGS[cveId] || null;
}

/**
 * Calculate MITRE ATT&CK coverage based on vulnerabilities
 * Returns percentage of tactics covered by discovered vulnerabilities
 */
export function calculateMitreAttackCoverage(vulnerabilities: any[]): {
  coverage: number;
  tacticsCovered: string[];
  tacticsNotCovered: string[];
  riskByTactic: Record<string, number>;
} {
  const tacticsCovered = new Set<string>();
  const riskByTactic: Record<string, number> = {};

  // Initialize all tactics with 0 risk
  MITRE_TACTICS.forEach((tactic) => {
    riskByTactic[tactic.name] = 0;
  });

  // Map vulnerabilities to tactics
  vulnerabilities.forEach((vuln) => {
    const mapping = mapCVEToMitre(vuln.cveId);
    if (mapping) {
      mapping.techniques.forEach((technique) => {
        tacticsCovered.add(technique.tactic);
        // Calculate risk based on CVSS and confidence
        const cvssScore = parseFloat(vuln.cvssScore || "0");
        const riskScore = (cvssScore / 10) * technique.confidence;
        riskByTactic[technique.tactic] = Math.max(
          riskByTactic[technique.tactic],
          riskScore
        );
      });
    }
  });

  const tacticsNotCovered = MITRE_TACTICS.filter(
    (t) => !tacticsCovered.has(t.name)
  ).map((t) => t.name);

  const tacticsCoveredArray = Array.from(tacticsCovered);

  const coverage = (tacticsCovered.size / MITRE_TACTICS.length) * 100;

  return {
    coverage: Math.round(coverage),
    tacticsCovered: tacticsCoveredArray,
    tacticsNotCovered,
    riskByTactic,
  };
}

/**
 * Get defensive recommendations based on MITRE ATT&CK techniques
 */
export function getDefensiveRecommendations(techniques: string[]): string[] {
  const recommendations: string[] = [];

  techniques.forEach((technique) => {
    switch (technique) {
      case "T1190": // Exploit Public-Facing Application
        recommendations.push(
          "Implementar WAF (Web Application Firewall)",
          "Manter aplicações atualizadas com patches de segurança",
          "Realizar testes de penetração regularmente",
          "Implementar rate limiting e detecção de anomalias"
        );
        break;
      case "T1059": // Command and Scripting Interpreter
        recommendations.push(
          "Desabilitar intérpretes de comando desnecessários",
          "Implementar Application Whitelisting",
          "Monitorar execução de scripts",
          "Usar PowerShell Constrained Language Mode"
        );
        break;
      case "T1047": // Windows Management Instrumentation
        recommendations.push(
          "Restringir acesso a WMI",
          "Monitorar eventos WMI",
          "Implementar detecção de anomalias em WMI",
          "Usar Group Policy para restringir WMI"
        );
        break;
      default:
        recommendations.push(
          "Implementar controlos de segurança específicos para esta técnica"
        );
    }
  });

  // Remove duplicates
  const uniqueRecommendations: string[] = [];
  const seen = new Set<string>();
  recommendations.forEach((rec) => {
    if (!seen.has(rec)) {
      uniqueRecommendations.push(rec);
      seen.add(rec);
    }
  });
  return uniqueRecommendations;
}

/**
 * Generate MITRE ATT&CK analysis report
 */
export function generateMitreAnalysisReport(vulnerabilities: any[]): {
  summary: string;
  coverage: ReturnType<typeof calculateMitreAttackCoverage>;
  topThreats: string[];
  recommendations: string[];
} {
  const coverage = calculateMitreAttackCoverage(vulnerabilities);

  // Get top 3 tactics by risk
  const topThreats = Object.entries(coverage.riskByTactic)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tactic]) => tactic);

  const recommendations = getDefensiveRecommendations(topThreats);

  const summary =
    coverage.coverage >= 70
      ? "Organização está exposta a múltiplas técnicas de ataque. Ação imediata recomendada."
      : coverage.coverage >= 40
        ? "Organização tem exposição moderada a técnicas de ataque. Melhorias necessárias."
        : "Organização tem exposição limitada a técnicas de ataque conhecidas. Continue monitorando.";

  return {
    summary,
    coverage,
    topThreats,
    recommendations,
  };
}
