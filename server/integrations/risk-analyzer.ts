/**
 * Risk Analysis Module
 * Analyzes CVSS scores and maps vulnerabilities to NIS2 requirements
 */

interface CVSSVector {
  version: string; // "3.0" or "3.1"
  av: string; // Attack Vector: N, A, L, P
  ac: string; // Attack Complexity: L, H
  pr: string; // Privileges Required: N, L, H
  ui: string; // User Interaction: N, R
  s: string; // Scope: U, C
  c: string; // Confidentiality: N, L, H
  i: string; // Integrity: N, L, H
  a: string; // Availability: N, L, H
}

interface RiskAssessment {
  cvssScore: number;
  severity: "critical" | "high" | "medium" | "low" | "info";
  riskLevel: "critical" | "high" | "medium" | "low";
  exploitability: "high" | "medium" | "low";
  impactLevel: "high" | "medium" | "low";
  nis2Articles: string[];
  nis2Requirement: string;
  businessImpact: string;
  remediationUrgency: "immediate" | "urgent" | "soon" | "planned";
}

/**
 * Parse CVSS 3.1 vector string
 */
export function parseCVSSVector(vectorString: string): CVSSVector | null {
  try {
    const parts = vectorString.split("/");
    if (parts.length < 2) return null;

    const vector: CVSSVector = {
      version: parts[0].split(":")[1] || "3.1",
      av: "",
      ac: "",
      pr: "",
      ui: "",
      s: "",
      c: "",
      i: "",
      a: "",
    };

    for (let i = 1; i < parts.length; i++) {
      const [key, value] = parts[i].split(":");
      if (key && value) {
        const lowerKey = key.toLowerCase();
        if (lowerKey === "av") vector.av = value;
        else if (lowerKey === "ac") vector.ac = value;
        else if (lowerKey === "pr") vector.pr = value;
        else if (lowerKey === "ui") vector.ui = value;
        else if (lowerKey === "s") vector.s = value;
        else if (lowerKey === "c") vector.c = value;
        else if (lowerKey === "i") vector.i = value;
        else if (lowerKey === "a") vector.a = value;
      }
    }

    return vector;
  } catch (error) {
    console.error("[RiskAnalyzer] Error parsing CVSS vector:", error);
    return null;
  }
}

/**
 * Determine severity from CVSS score
 */
export function determineSeverity(
  cvssScore: number
): "critical" | "high" | "medium" | "low" | "info" {
  if (cvssScore >= 9.0) return "critical";
  if (cvssScore >= 7.0) return "high";
  if (cvssScore >= 4.0) return "medium";
  if (cvssScore > 0) return "low";
  return "info";
}

/**
 * Assess exploitability based on CVSS vector
 */
export function assessExploitability(vector: CVSSVector | null): "high" | "medium" | "low" {
  if (!vector) return "medium";

  let score = 0;

  // Attack Vector (AV)
  if (vector.av === "N") score += 3; // Network
  else if (vector.av === "A") score += 2; // Adjacent
  else if (vector.av === "L") score += 1; // Local
  else if (vector.av === "P") score += 0; // Physical

  // Attack Complexity (AC)
  if (vector.ac === "L") score += 2; // Low
  else if (vector.ac === "H") score += 1; // High

  // Privileges Required (PR)
  if (vector.pr === "N") score += 2; // None
  else if (vector.pr === "L") score += 1; // Low
  else if (vector.pr === "H") score += 0; // High

  // User Interaction (UI)
  if (vector.ui === "N") score += 1; // None
  else if (vector.ui === "R") score += 0; // Required

  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  return "low";
}

/**
 * Assess impact level based on CVSS vector
 */
export function assessImpactLevel(vector: CVSSVector | null): "high" | "medium" | "low" {
  if (!vector) return "medium";

  let score = 0;

  // Confidentiality (C)
  if (vector.c === "H") score += 2;
  else if (vector.c === "L") score += 1;

  // Integrity (I)
  if (vector.i === "H") score += 2;
  else if (vector.i === "L") score += 1;

  // Availability (A)
  if (vector.a === "H") score += 2;
  else if (vector.a === "L") score += 1;

  if (score >= 5) return "high";
  if (score >= 2) return "medium";
  return "low";
}

/**
 * Perform comprehensive risk assessment
 */
export function assessRisk(
  cvssScore: number,
  vectorString: string,
  description: string,
  hasExploit: boolean
): RiskAssessment {
  const severity = determineSeverity(cvssScore);
  const vector = parseCVSSVector(vectorString);
  const exploitability = assessExploitability(vector);
  const impactLevel = assessImpactLevel(vector);

  // Determine risk level (higher than severity if exploit available)
  let riskLevel: "critical" | "high" | "medium" | "low" = severity as any;
  if (hasExploit && riskLevel !== "critical") {
    if (riskLevel === "high") riskLevel = "critical";
    else if (riskLevel === "medium") riskLevel = "high";
  }

  // Map to NIS2 articles
  const nis2Articles = mapToNIS2Articles(description, cvssScore, exploitability);
  const nis2Requirement = generateNIS2Requirement(nis2Articles, description);

  // Assess business impact
  const businessImpact = assessBusinessImpact(impactLevel, description);

  // Determine remediation urgency
  const remediationUrgency = determineRemediationUrgency(riskLevel, hasExploit);

  return {
    cvssScore,
    severity,
    riskLevel,
    exploitability,
    impactLevel,
    nis2Articles,
    nis2Requirement,
    businessImpact,
    remediationUrgency,
  };
}

/**
 * Map vulnerability to NIS2 articles
 */
export function mapToNIS2Articles(
  description: string,
  cvssScore: number,
  exploitability: string
): string[] {
  const articles: string[] = [];
  const desc = description.toLowerCase();

  // Article 21: Security of networks and information systems
  articles.push("Art. 21");

  // Article 21.1(a): Authentication and access control
  if (
    desc.includes("authentication") ||
    desc.includes("authorization") ||
    desc.includes("privilege") ||
    desc.includes("access control")
  ) {
    articles.push("Art. 21.1(a)");
  }

  // Article 21.1(b): Encryption and confidentiality
  if (
    desc.includes("encryption") ||
    desc.includes("cryptography") ||
    desc.includes("confidentiality") ||
    desc.includes("ssl") ||
    desc.includes("tls")
  ) {
    articles.push("Art. 21.1(b)");
  }

  // Article 21.1(c): Availability and business continuity
  if (
    desc.includes("availability") ||
    desc.includes("denial of service") ||
    desc.includes("dos") ||
    desc.includes("ddos") ||
    desc.includes("crash") ||
    desc.includes("outage")
  ) {
    articles.push("Art. 21.1(c)");
  }

  // Article 21.1(d): Incident handling
  if (
    desc.includes("remote code execution") ||
    desc.includes("rce") ||
    desc.includes("arbitrary code")
  ) {
    articles.push("Art. 21.1(d)");
  }

  // Article 28: Obligations of essential service providers
  if (cvssScore >= 7.0 || exploitability === "high") {
    articles.push("Art. 28");
  }

  // Article 28.2: Supply chain security
  if (
    desc.includes("supply chain") ||
    desc.includes("third party") ||
    desc.includes("dependency") ||
    desc.includes("library")
  ) {
    articles.push("Art. 28.2");
  }

  return Array.from(new Set(articles)); // Remove duplicates
}

/**
 * Generate specific NIS2 requirement text
 */
export function generateNIS2Requirement(articles: string[], description: string): string {
  const desc = description.toLowerCase();

  if (articles.includes("Art. 21.1(a)")) {
    return "Implementar controlos de autenticação e autorização robustos para prevenir acesso não autorizado.";
  }

  if (articles.includes("Art. 21.1(b)")) {
    return "Aplicar encriptação forte em dados em trânsito e em repouso, conforme especificado na legislação.";
  }

  if (articles.includes("Art. 21.1(c)")) {
    return "Garantir a disponibilidade contínua dos sistemas e implementar planos de recuperação de desastres.";
  }

  if (articles.includes("Art. 21.1(d)")) {
    return "Implementar sistemas de detecção e resposta a incidentes, com capacidade de investigação forense.";
  }

  if (articles.includes("Art. 28.2")) {
    return "Avaliar e monitorizar a segurança dos fornecedores e dependências de terceiros regularmente.";
  }

  return "Implementar medidas de segurança adequadas conforme exigido pela Diretiva NIS2.";
}

/**
 * Assess business impact
 */
export function assessBusinessImpact(impactLevel: string, description: string): string {
  const desc = description.toLowerCase();

  if (impactLevel === "high") {
    if (desc.includes("availability")) {
      return "Risco crítico de indisponibilidade de serviços essenciais. Impacto potencial: perda de receita, danos à reputação.";
    }
    if (desc.includes("confidentiality")) {
      return "Risco crítico de exposição de dados sensíveis. Impacto potencial: violação de privacidade, conformidade regulatória.";
    }
    if (desc.includes("integrity")) {
      return "Risco crítico de corrupção de dados. Impacto potencial: perda de confiabilidade, falhas operacionais.";
    }
    return "Risco crítico de comprometimento do sistema. Ação imediata recomendada.";
  }

  if (impactLevel === "medium") {
    return "Risco moderado com potencial para impacto operacional. Remediar dentro de 30 dias.";
  }

  return "Risco baixo, mas deve ser monitorizado. Remediar conforme planeado.";
}

/**
 * Determine remediation urgency
 */
export function determineRemediationUrgency(
  riskLevel: string,
  hasExploit: boolean
): "immediate" | "urgent" | "soon" | "planned" {
  if (riskLevel === "critical" || (riskLevel === "high" && hasExploit)) {
    return "immediate";
  }

  if (riskLevel === "high") {
    return "urgent";
  }

  if (riskLevel === "medium") {
    return "soon";
  }

  return "planned";
}

/**
 * Generate remediation steps for PT-PT
 */
export function generateRemediationSteps(
  description: string,
  severity: string
): string[] {
  const desc = description.toLowerCase();
  const steps: string[] = [];

  // Generic first step
  steps.push("1. Identificar todos os sistemas afetados pela vulnerabilidade");

  // Specific steps based on vulnerability type
  if (desc.includes("authentication") || desc.includes("password")) {
    steps.push("2. Forçar redefinição de palavras-passe para todos os utilizadores afetados");
    steps.push("3. Implementar autenticação multifator (MFA) se não estiver ativa");
    steps.push("4. Revisar e reforçar políticas de controlo de acesso");
  }

  if (desc.includes("encryption") || desc.includes("ssl") || desc.includes("tls")) {
    steps.push("2. Atualizar certificados SSL/TLS para versões seguras");
    steps.push("3. Desativar protocolos de encriptação desatualizados (SSLv3, TLSv1.0)");
    steps.push("4. Implementar HSTS (HTTP Strict Transport Security)");
  }

  if (desc.includes("patch") || desc.includes("update")) {
    steps.push("2. Aplicar o patch de segurança mais recente do fornecedor");
    steps.push("3. Testar a atualização em ambiente de teste antes de implementar em produção");
    steps.push("4. Agendar janela de manutenção para aplicar em produção");
  }

  if (desc.includes("remote code") || desc.includes("rce")) {
    steps.push("2. Isolar imediatamente o sistema afetado da rede, se possível");
    steps.push("3. Aplicar o patch de segurança urgentemente");
    steps.push("4. Verificar logs para sinais de exploração");
    steps.push("5. Restaurar a partir de backup limpo se necessário");
  }

  if (desc.includes("denial of service") || desc.includes("dos")) {
    steps.push("2. Implementar rate limiting e proteção contra DDoS");
    steps.push("3. Configurar WAF (Web Application Firewall) com regras apropriadas");
    steps.push("4. Monitorizar o tráfego de rede para atividade anómala");
  }

  // Generic final steps
  if (steps.length === 1) {
    steps.push("2. Aplicar o patch ou atualização recomendada pelo fornecedor");
    steps.push("3. Testar a solução em ambiente controlado");
    steps.push("4. Implementar em produção durante janela de manutenção");
  }

  steps.push(`${steps.length + 1}. Validar que a vulnerabilidade foi remediada`);
  steps.push(`${steps.length + 1}. Documentar as ações tomadas para conformidade NIS2`);

  return steps;
}
