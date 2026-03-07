import axios from "axios";
import { getCVEFromCache, cacheCVE } from "../db";

const VULNERS_BASE_URL = "https://vulners.com/api/v3";
const VULNERS_API_KEY = process.env.VULNERS_API_KEY; // Should be set in environment

interface VulnersRecord {
  id: string;
  title: string;
  description: string;
  published: string;
  updated: string;
  cvelist: string[];
  type: string;
  sourceData?: {
    nvd?: {
      cvssScore?: number;
      cvssVector?: string;
    };
  };
  references?: string[];
}

interface VulnersSearchResponse {
  total: number;
  results: VulnersRecord[];
  skip: number;
  size: number;
}

interface VulnersAuditResponse {
  audit: Array<{
    is_exploited: boolean;
    cvelist: string[];
    bulletins: VulnersRecord[];
  }>;
}

/**
 * Search for vulnerabilities in Vulners database
 */
export async function searchVulnerabilities(
  query: string,
  limit = 20
): Promise<VulnersRecord[]> {
  try {
    if (!VULNERS_API_KEY) {
      console.warn("[Vulners] API key not configured");
      return [];
    }

    const response = await axios.post<VulnersSearchResponse>(
      `${VULNERS_BASE_URL}/search/lucene/`,
      {
        query,
        skip: 0,
        size: Math.min(limit, 100),
      },
      {
        headers: {
          "X-Api-Key": VULNERS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.results || [];
  } catch (error) {
    console.error("[Vulners] Error searching vulnerabilities:", error);
    return [];
  }
}

/**
 * Get exploit information for a CVE
 */
export async function getExploitInfo(cveId: string): Promise<VulnersRecord[]> {
  try {
    if (!VULNERS_API_KEY) {
      console.warn("[Vulners] API key not configured");
      return [];
    }

    const response = await axios.post<VulnersSearchResponse>(
      `${VULNERS_BASE_URL}/search/lucene/`,
      {
        query: `${cveId} AND type:exploit`,
        skip: 0,
        size: 10,
      },
      {
        headers: {
          "X-Api-Key": VULNERS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.results || [];
  } catch (error) {
    console.error(`[Vulners] Error getting exploit info for ${cveId}:`, error);
    return [];
  }
}

/**
 * Audit a host for vulnerabilities
 */
export async function auditHost(
  packages: Array<{ name: string; version: string }>
): Promise<VulnersAuditResponse> {
  try {
    if (!VULNERS_API_KEY) {
      console.warn("[Vulners] API key not configured");
      return { audit: [] };
    }

    const response = await axios.post<VulnersAuditResponse>(
      `${VULNERS_BASE_URL}/audit/`,
      {
        package: packages,
      },
      {
        headers: {
          "X-Api-Key": VULNERS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("[Vulners] Error auditing host:", error);
    return { audit: [] };
  }
}

/**
 * Get vulnerability details from Vulners
 */
export async function getVulnerabilityDetails(vulnId: string): Promise<VulnersRecord | null> {
  try {
    if (!VULNERS_API_KEY) {
      console.warn("[Vulners] API key not configured");
      return null;
    }

    const response = await axios.post<VulnersSearchResponse>(
      `${VULNERS_BASE_URL}/search/lucene/`,
      {
        query: `id:${vulnId}`,
        skip: 0,
        size: 1,
      },
      {
        headers: {
          "X-Api-Key": VULNERS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }

    return null;
  } catch (error) {
    console.error(`[Vulners] Error getting details for ${vulnId}:`, error);
    return null;
  }
}

/**
 * Enrich CVE data with Vulners information
 */
export async function enrichCVEWithVulners(cveId: string): Promise<{
  exploits: VulnersRecord[];
  advisories: VulnersRecord[];
  bulletins: VulnersRecord[];
}> {
  try {
    if (!VULNERS_API_KEY) {
      return { exploits: [], advisories: [], bulletins: [] };
    }

    const [exploits, advisories, bulletins] = await Promise.all([
      searchVulnerabilities(`${cveId} AND type:exploit`, 5),
      searchVulnerabilities(`${cveId} AND type:advisory`, 5),
      searchVulnerabilities(`${cveId} AND type:bulletin`, 5),
    ]);

    return {
      exploits,
      advisories,
      bulletins,
    };
  } catch (error) {
    console.error(`[Vulners] Error enriching CVE ${cveId}:`, error);
    return { exploits: [], advisories: [], bulletins: [] };
  }
}

/**
 * Extract CVSS score from Vulners record
 */
export function extractCVSSScore(record: VulnersRecord): number | null {
  try {
    return record.sourceData?.nvd?.cvssScore || null;
  } catch (error) {
    console.error("[Vulners] Error extracting CVSS score:", error);
    return null;
  }
}

/**
 * Check if exploit is available for CVE
 */
export async function hasExploit(cveId: string): Promise<boolean> {
  try {
    const exploits = await getExploitInfo(cveId);
    return exploits.length > 0;
  } catch (error) {
    console.error(`[Vulners] Error checking exploit for ${cveId}:`, error);
    return false;
  }
}
