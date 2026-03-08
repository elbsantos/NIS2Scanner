import { execSync } from "child_process";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export interface NmapScanOptions {
  target: string; // IP, hostname, or CIDR range
  mode: "sme" | "supply"; // SME = quick, Supply = comprehensive
  timeout?: number; // Timeout in seconds
  verbosity?: number; // 0-3
}

export interface NmapPort {
  port: number;
  protocol: string;
  state: string; // open, closed, filtered
  service: string;
  product?: string;
  version?: string;
}

export interface NmapHost {
  ip: string;
  hostname?: string;
  status: string;
  ports: NmapPort[];
  osDetection?: string;
  uptime?: string;
}

export interface NmapScanResult {
  target: string;
  startTime: string;
  endTime: string;
  duration: number; // seconds
  hosts: NmapHost[];
  summary: {
    hostsUp: number;
    hostsDown: number;
    totalPorts: number;
    openPorts: number;
    closedPorts: number;
    filteredPorts: number;
  };
}

/**
 * Build Nmap command arguments based on scan mode
 */
function buildNmapCommand(options: NmapScanOptions): string[] {
  const args: string[] = [];

  // Add target
  args.push(options.target);

  if (options.mode === "sme") {
    // SME Mode: Quick scan of common ports
    args.push("-p", "22,80,443,445,3389,3306,5432,5984,6379,8080,8443,9200");
    args.push("-sV"); // Service version detection
    args.push("--script", "vuln"); // Run vulnerability scripts
    args.push("-T4"); // Aggressive timing
  } else {
    // Supply Chain Mode: Comprehensive scan
    args.push("-p-"); // All ports
    args.push("-sV"); // Service version detection
    args.push("-sC"); // Default scripts
    args.push("--script", "vuln,ssl-enum-ciphers,ssh-hostkey"); // Vulnerability and security scripts
    args.push("-O"); // OS detection
    args.push("-A"); // Aggressive scan (OS, version, script, traceroute)
    args.push("-T3"); // Normal timing
  }

  // Common arguments
  args.push("-oX", "-"); // Output in XML format to stdout
  args.push("--host-timeout", `${options.timeout || 3600}s`);

  if (options.verbosity) {
    args.push(`-${"v".repeat(options.verbosity)}`);
  }

  return args;
}

/**
 * Parse Nmap XML output
 */
function parseNmapXML(xmlOutput: string, scanOptions?: NmapScanOptions): NmapScanResult {
  const startTime = new Date().toISOString();
  const hosts: NmapHost[] = [];

  try {
    // Simple XML parsing (for production, use xml2js or similar)
    const hostMatches = xmlOutput.match(/<host[^>]*>[\s\S]*?<\/host>/g) || [];

    hostMatches.forEach((hostXml) => {
      const ipMatch = hostXml.match(/addr="([^"]+)"/);
      const statusMatch = hostXml.match(/<status state="([^"]+)"/);

      if (ipMatch && statusMatch) {
        const host: NmapHost = {
          ip: ipMatch[1],
          status: statusMatch[1],
          ports: [],
        };

        // Extract hostname
        const hostnameMatch = hostXml.match(/name="([^"]+)"/);
        if (hostnameMatch) {
          host.hostname = hostnameMatch[1];
        }

        // Extract ports
        const portMatches = hostXml.match(/<port[^>]*>[\s\S]*?<\/port>/g) || [];
        portMatches.forEach((portXml) => {
          const portMatch = portXml.match(/portid="(\d+)\/(\w+)"/);
          const stateMatch = portXml.match(/<state state="([^"]+)"/);
          const serviceMatch = portXml.match(/<service name="([^"]+)"/);
          const productMatch = portXml.match(/product="([^"]+)"/);
          const versionMatch = portXml.match(/version="([^"]+)"/);

          if (portMatch && stateMatch) {
            host.ports.push({
              port: parseInt(portMatch[1]),
              protocol: portMatch[2],
              state: stateMatch[1],
              service: serviceMatch ? serviceMatch[1] : "unknown",
              product: productMatch ? productMatch[1] : undefined,
              version: versionMatch ? versionMatch[1] : undefined,
            });
          }
        });

        hosts.push(host);
      }
    });
  } catch (error) {
    console.error("[Nmap] Error parsing XML output:", error);
  }

  // Calculate summary
  const summary = {
    hostsUp: hosts.filter((h) => h.status === "up").length,
    hostsDown: hosts.filter((h) => h.status === "down").length,
    totalPorts: hosts.reduce((sum, h) => sum + h.ports.length, 0),
    openPorts: hosts.reduce(
      (sum, h) => sum + h.ports.filter((p) => p.state === "open").length,
      0
    ),
    closedPorts: hosts.reduce(
      (sum, h) => sum + h.ports.filter((p) => p.state === "closed").length,
      0
    ),
    filteredPorts: hosts.reduce(
      (sum, h) => sum + h.ports.filter((p) => p.state === "filtered").length,
      0
    ),
  };

  const endTime = new Date().toISOString();
  const duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);

  return {
    target: scanOptions?.target || "unknown",
    startTime,
    endTime,
    duration,
    hosts,
    summary,
  };
}

/**
 * Execute Nmap scan
 */
export async function executeScan(options: NmapScanOptions): Promise<NmapScanResult> {
  try {
    console.log(`[Nmap] Starting ${options.mode} mode scan on ${options.target}`);

    const args = buildNmapCommand(options);
    const command = `nmap ${args.join(" ")}`;

    console.log(`[Nmap] Command: ${command}`);

    const output = execSync(command, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: (options.timeout || 3600) * 1000 + 60000, // Add 1 minute buffer
    });

    const result = parseNmapXML(output, options);

    console.log(
      `[Nmap] Scan completed. Found ${result.summary.hostsUp} hosts up, ${result.summary.openPorts} open ports`
    );

    return result;
  } catch (error) {
    console.error("[Nmap] Scan execution error:", error);
    throw new Error(`Nmap scan failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate target before scanning
 */
export function validateTarget(target: string): boolean {
  if (!target || target.length === 0) return false;

  // Validate IPv4 or CIDR
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
  if (ipv4Regex.test(target)) {
    // Validate that each octet is 0-255
    const parts = target.split("/")[0].split(".");
    return parts.every((part) => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
  }

  // Validate hostname
  const hostnameRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
  if (hostnameRegex.test(target)) {
    return !target.includes(".."); // Reject double dots
  }

  return false;
}

/**
 * Check if Nmap is installed
 */
export function isNmapInstalled(): boolean {
  try {
    execSync("which nmap", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get Nmap version
 */
export function getNmapVersion(): string {
  try {
    const output = execSync("nmap --version", { encoding: "utf-8" });
    const match = output.match(/Nmap version ([\d.]+)/);
    return match ? match[1] : "unknown";
  } catch {
    return "not installed";
  }
}

/**
 * Filter ports by severity (for SME mode)
 */
export function filterCriticalPorts(ports: NmapPort[]): NmapPort[] {
  const criticalServices = [
    "ssh",
    "http",
    "https",
    "smb",
    "rdp",
    "mysql",
    "postgresql",
    "mongodb",
    "redis",
    "elasticsearch",
  ];

  return ports.filter(
    (p) =>
      p.state === "open" &&
      criticalServices.some((service) => p.service.toLowerCase().includes(service))
  );
}

/**
 * Extract vulnerable services from scan results
 */
export function extractVulnerableServices(result: NmapScanResult): Array<{
  ip: string;
  port: number;
  service: string;
  product?: string;
  version?: string;
}> {
  const vulnerable: Array<{
    ip: string;
    port: number;
    service: string;
    product?: string;
    version?: string;
  }> = [];

  result.hosts.forEach((host) => {
    host.ports
      .filter((p) => p.state === "open")
      .forEach((port) => {
        vulnerable.push({
          ip: host.ip,
          port: port.port,
          service: port.service,
          product: port.product,
          version: port.version,
        });
      });
  });

  return vulnerable;
}
