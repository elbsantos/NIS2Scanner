import { executeScan, extractVulnerableServices, validateTarget, type NmapScanResult } from "../integrations/nmap-scanner";
import { searchCVEsByKeyword, getCVEById, extractCVSSScore } from "../integrations/nvd";
import { enrichCVEWithVulners } from "../integrations/vulners";
import { assessRisk } from "../integrations/risk-analyzer";
import { createVulnerability, updateScanStatus } from "../db";
import type { vulnerabilities } from "../../drizzle/schema";

export interface ScanExecutionOptions {
  scanId: number;
  organizationId: number;
  targetRange: string;
  mode: "sme" | "supply";
  timeout?: number;
}

export interface ScanExecutionResult {
  scanId: number;
  success: boolean;
  nmapResult?: NmapScanResult;
  vulnerabilitiesFound: number;
  vulnerabilityIds: number[];
  error?: string;
  duration: number; // milliseconds
}

/**
 * Execute a complete scan with Nmap and vulnerability analysis
 */
export async function executeScanWithAnalysis(
  options: ScanExecutionOptions
): Promise<ScanExecutionResult> {
  const startTime = Date.now();

  try {
    // Validate target
    if (!validateTarget(options.targetRange)) {
      throw new Error(`Invalid target: ${options.targetRange}`);
    }

    console.log(
      `[ScanExecutor] Starting ${options.mode} scan for organization ${options.organizationId}`
    );

    // Execute Nmap scan
    const nmapResult = await executeScan({
      target: options.targetRange,
      mode: options.mode,
      timeout: options.timeout || 3600,
    });

    console.log(
      `[ScanExecutor] Nmap completed. Found ${nmapResult.summary.openPorts} open ports`
    );

    // Extract vulnerable services
    const vulnerableServices = extractVulnerableServices(nmapResult);

    if (vulnerableServices.length === 0) {
      console.log("[ScanExecutor] No vulnerable services found");
      return {
        scanId: options.scanId,
        success: true,
        nmapResult,
        vulnerabilitiesFound: 0,
        vulnerabilityIds: [],
        duration: Date.now() - startTime,
      };
    }

    // Analyze each vulnerable service
    const vulnerabilityIds: number[] = [];

    for (const service of vulnerableServices) {
      try {
        // Search for CVEs related to the service
        const searchQuery = `${service.product || service.service} ${service.version || ""}`;
        const cves = await searchCVEsByKeyword(searchQuery, 10);

        for (const cve of cves) {
          try {
            // Get detailed CVE information
            const cveDetails = await getCVEById(cve.id);
            if (!cveDetails) continue;

            // Extract CVSS score
            const cvssInfo = extractCVSSScore(cveDetails);
            if (!cvssInfo) continue;

            // Enrich with Vulners data
            const vulnersData = await enrichCVEWithVulners(cve.id);

            // Assess risk
            const riskAssessment = assessRisk(
              cvssInfo.score,
              cvssInfo.vector,
              cve.id,
              vulnersData.exploits.length > 0
            );

            // Create vulnerability record
            const vulnData: typeof vulnerabilities.$inferInsert = {
              scanId: options.scanId,
              cveId: cve.id,
              title: cveDetails.id,
              description: cve.id,
              severity: riskAssessment.severity,
              cvssScore: cvssInfo.score as any,
              cvssVector: cvssInfo.vector,
              affectedSoftware: service.product || service.service,
              affectedVersion: service.version,
              exploitAvailable: vulnersData.exploits.length > 0,
              nis2Articles: JSON.stringify(riskAssessment.nis2Articles),
              remediationDetails: riskAssessment.nis2Requirement,
            };

            const result = await createVulnerability(vulnData);
            if (result[0]?.insertId) {
              vulnerabilityIds.push(result[0].insertId as number);
            }

            console.log(
              `[ScanExecutor] Created vulnerability record for ${cve.id} (severity: ${riskAssessment.severity})`
            );
          } catch (error) {
            console.error(`[ScanExecutor] Error processing CVE ${cve.id}:`, error);
            continue;
          }
        }
      } catch (error) {
        console.error(
          `[ScanExecutor] Error analyzing service ${service.product}:${service.port}:`,
          error
        );
        continue;
      }
    }

    // Update scan status
    await updateScanStatus(options.scanId, "completed");

    console.log(
      `[ScanExecutor] Scan completed successfully. Found ${vulnerabilityIds.length} vulnerabilities`
    );

    // TODO: Create audit log for scan completion

    return {
      scanId: options.scanId,
      success: true,
      nmapResult,
      vulnerabilitiesFound: vulnerabilityIds.length,
      vulnerabilityIds,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[ScanExecutor] Scan execution failed:", errorMessage);

    // Update scan status to failed
    await updateScanStatus(options.scanId, "failed").catch((err) => {
      console.error("[ScanExecutor] Failed to update scan status:", err);
    });

    return {
      scanId: options.scanId,
      success: false,
      vulnerabilitiesFound: 0,
      vulnerabilityIds: [],
      error: errorMessage,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Execute scan in background (non-blocking)
 */
export async function executeScanAsync(
  options: ScanExecutionOptions
): Promise<{ jobId: string }> {
  // In production, this would queue the job to a background worker
  // For now, we'll execute it asynchronously
  const jobId = `scan-${options.scanId}-${Date.now()}`;

  // Execute in background without awaiting
  executeScanWithAnalysis(options).catch((error) => {
    console.error(`[ScanExecutor] Background scan ${jobId} failed:`, error);
  });

  return { jobId };
}

/**
 * Get scan execution status
 */
export async function getScanStatus(
  scanId: number
): Promise<{
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  message: string;
}> {
  // TODO: Implement status tracking from database
  return {
    status: "pending",
    progress: 0,
    message: "Scan queued",
  };
}
