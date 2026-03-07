import axios from "axios";
import { getCVEFromCache, cacheCVE } from "../db";

const NVD_BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0";
const NVD_API_KEY = process.env.NVD_API_KEY; // Should be set in environment

interface CVEData {
  id: string;
  sourceIdentifier: string;
  published: string;
  lastModified: string;
  vulnStatus: string;
  descriptions: Array<{
    lang: string;
    value: string;
  }>;
  metrics: {
    cvssMetricV31?: Array<{
      source: string;
      type: string;
      cvssData: {
        version: string;
        vectorString: string;
        baseScore: number;
        baseSeverity: string;
      };
    }>;
  };
  weaknesses: Array<{
    source: string;
    type: string;
    description: Array<{
      lang: string;
      value: string;
    }>;
  }>;
  references: Array<{
    url: string;
    source: string;
    tags?: string[];
  }>;
  configurations: Array<{
    operator: string;
    negate: boolean;
    nodes: Array<{
      operator: string;
      negate: boolean;
      cpeMatch: Array<{
        vulnerable: boolean;
        criteria: string;
        matchCriteriaId: string;
        versionStartIncluding?: string;
        versionEndIncluding?: string;
      }>;
    }>;
  }>;
}

interface NVDSearchResponse {
  resultsPerPage: number;
  startIndex: number;
  totalResults: number;
  format: string;
  version: string;
  timestamp: string;
  vulnerabilities: Array<{
    cve: CVEData;
  }>;
}

/**
 * Search for CVEs in NVD by keyword
 */
export async function searchCVEsByKeyword(keyword: string, limit = 20): Promise<CVEData[]> {
  try {
    const params: Record<string, unknown> = {
      resultsPerPage: Math.min(limit, 200),
      startIndex: 0,
      keywordSearch: keyword,
    };

    if (NVD_API_KEY) {
      params.apiKey = NVD_API_KEY;
    }

    const response = await axios.get<NVDSearchResponse>(NVD_BASE_URL, { params });

    if (response.data.vulnerabilities) {
      return response.data.vulnerabilities.map((v) => v.cve);
    }

    return [];
  } catch (error) {
    console.error("[NVD] Error searching CVEs:", error);
    throw error;
  }
}

/**
 * Get detailed CVE information by CVE ID
 */
export async function getCVEById(cveId: string): Promise<CVEData | null> {
  try {
    // Check cache first
    const cached = await getCVEFromCache(cveId);
    if (cached && cached.data) {
      return JSON.parse(cached.data) as CVEData;
    }

    const params: Record<string, unknown> = {
      cveId,
    };

    if (NVD_API_KEY) {
      params.apiKey = NVD_API_KEY;
    }

    const response = await axios.get<NVDSearchResponse>(NVD_BASE_URL, { params });

    if (response.data.vulnerabilities && response.data.vulnerabilities.length > 0) {
      const cveData = response.data.vulnerabilities[0].cve;

      // Cache the result
      await cacheCVE(cveId, cveData as any, "nvd", 30);

      return cveData;
    }

    return null;
  } catch (error) {
    console.error(`[NVD] Error fetching CVE ${cveId}:`, error);
    throw error;
  }
}

/**
 * Extract CVSS score from CVE data
 */
export function extractCVSSScore(cveData: CVEData): { score: number; severity: string; vector: string } | null {
  try {
    const cvssMetric = cveData.metrics?.cvssMetricV31?.[0];

    if (cvssMetric) {
      return {
        score: cvssMetric.cvssData.baseScore,
        severity: cvssMetric.cvssData.baseSeverity.toLowerCase(),
        vector: cvssMetric.cvssData.vectorString,
      };
    }

    return null;
  } catch (error) {
    console.error("[NVD] Error extracting CVSS score:", error);
    return null;
  }
}

/**
 * Extract description from CVE data
 */
export function extractDescription(cveData: CVEData): string {
  try {
    const enDescription = cveData.descriptions?.find((d) => d.lang === "en");
    return enDescription?.value || "No description available";
  } catch (error) {
    console.error("[NVD] Error extracting description:", error);
    return "No description available";
  }
}

/**
 * Extract affected software and versions
 */
export function extractAffectedSoftware(
  cveData: CVEData
): Array<{ software: string; versions: string[] }> {
  try {
    const affected: Array<{ software: string; versions: string[] }> = [];

    cveData.configurations?.forEach((config) => {
      config.nodes?.forEach((node) => {
        node.cpeMatch?.forEach((match) => {
          if (match.vulnerable) {
            // Parse CPE string to extract software name
            const cpeParts = match.criteria.split(":");
            if (cpeParts.length >= 5) {
              const vendor = cpeParts[3];
              const product = cpeParts[4];
              const version = cpeParts[5] || "*";

              const key = `${vendor}:${product}`;
              const existing = affected.find((a) => a.software === key);

              if (existing) {
                if (!existing.versions.includes(version)) {
                  existing.versions.push(version);
                }
              } else {
                affected.push({
                  software: key,
                  versions: [version],
                });
              }
            }
          }
        });
      });
    });

    return affected;
  } catch (error) {
    console.error("[NVD] Error extracting affected software:", error);
    return [];
  }
}

/**
 * Map CVE to NIS2 articles based on severity and type
 */
export function mapCVEToNIS2Articles(cveData: CVEData, cvssScore: number): string[] {
  const articles: string[] = [];

  // All vulnerabilities relate to Article 21 (Security of networks and information systems)
  articles.push("Art. 21");

  // High and critical vulnerabilities also relate to Article 28 (Obligations of essential service providers)
  if (cvssScore >= 7.0) {
    articles.push("Art. 28");
  }

  // Check for specific vulnerability types
  const description = extractDescription(cveData).toLowerCase();

  if (description.includes("authentication") || description.includes("authorization")) {
    articles.push("Art. 21.1(a)"); // Authentication and access control
  }

  if (description.includes("encryption") || description.includes("cryptography")) {
    articles.push("Art. 21.1(b)"); // Encryption
  }

  if (description.includes("availability") || description.includes("denial")) {
    articles.push("Art. 21.1(c)"); // Availability
  }

  if (description.includes("supply chain") || description.includes("third party")) {
    articles.push("Art. 28.2"); // Supply chain security
  }

  return Array.from(new Set(articles)); // Remove duplicates
}
