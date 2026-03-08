import { describe, it, expect, beforeAll } from "vitest";
import {
  validateTarget,
  isNmapInstalled,
  getNmapVersion,
  filterCriticalPorts,
  extractVulnerableServices,
  type NmapScanResult,
  type NmapPort,
} from "./nmap-scanner";

describe("Nmap Scanner Module", () => {
  describe("validateTarget", () => {
    it("should validate IPv4 addresses", () => {
      expect(validateTarget("192.168.1.1")).toBe(true);
      expect(validateTarget("10.0.0.0")).toBe(true);
      expect(validateTarget("172.16.0.1")).toBe(true);
    });

    it("should validate CIDR ranges", () => {
      expect(validateTarget("192.168.1.0/24")).toBe(true);
      expect(validateTarget("10.0.0.0/8")).toBe(true);
      expect(validateTarget("172.16.0.0/12")).toBe(true);
    });

    it("should validate hostnames", () => {
      expect(validateTarget("localhost")).toBe(true);
      expect(validateTarget("example.com")).toBe(true);
      expect(validateTarget("sub.example.com")).toBe(true);
      expect(validateTarget("test-server.local")).toBe(true);
    });

    it("should reject invalid targets", () => {
      expect(validateTarget("999.999.999.999")).toBe(false);
      expect(validateTarget("invalid..hostname")).toBe(false);
      expect(validateTarget("")).toBe(false);
    });
  });

  describe("isNmapInstalled", () => {
    it("should detect if Nmap is installed", () => {
      const installed = isNmapInstalled();
      expect(typeof installed).toBe("boolean");
    });
  });

  describe("getNmapVersion", () => {
    it("should return version string", () => {
      const version = getNmapVersion();
      expect(typeof version).toBe("string");
      expect(version.length).toBeGreaterThan(0);
    });
  });

  describe("filterCriticalPorts", () => {
    it("should filter only open critical service ports", () => {
      const ports: NmapPort[] = [
        {
          port: 22,
          protocol: "tcp",
          state: "open",
          service: "ssh",
        },
        {
          port: 80,
          protocol: "tcp",
          state: "open",
          service: "http",
        },
        {
          port: 443,
          protocol: "tcp",
          state: "open",
          service: "https",
        },
        {
          port: 8080,
          protocol: "tcp",
          state: "closed",
          service: "http-alt",
        },
        {
          port: 12345,
          protocol: "tcp",
          state: "open",
          service: "unknown",
        },
      ];

      const filtered = filterCriticalPorts(ports);

      expect(filtered.length).toBe(3);
      expect(filtered.every((p) => p.state === "open")).toBe(true);
      expect(filtered.some((p) => p.service === "ssh")).toBe(true);
      expect(filtered.some((p) => p.service === "http")).toBe(true);
    });

    it("should include database services", () => {
      const ports: NmapPort[] = [
        {
          port: 3306,
          protocol: "tcp",
          state: "open",
          service: "mysql",
        },
        {
          port: 5432,
          protocol: "tcp",
          state: "open",
          service: "postgresql",
        },
        {
          port: 6379,
          protocol: "tcp",
          state: "open",
          service: "redis",
        },
      ];

      const filtered = filterCriticalPorts(ports);
      expect(filtered.length).toBe(3);
    });

    it("should return empty array for no critical ports", () => {
      const ports: NmapPort[] = [
        {
          port: 12345,
          protocol: "tcp",
          state: "open",
          service: "unknown",
        },
        {
          port: 54321,
          protocol: "tcp",
          state: "closed",
          service: "unknown",
        },
      ];

      const filtered = filterCriticalPorts(ports);
      expect(filtered.length).toBe(0);
    });
  });

  describe("extractVulnerableServices", () => {
    it("should extract all open ports from scan results", () => {
      const result: NmapScanResult = {
        target: "192.168.1.0/24",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 60,
        hosts: [
          {
            ip: "192.168.1.1",
            status: "up",
            ports: [
              {
                port: 22,
                protocol: "tcp",
                state: "open",
                service: "ssh",
                product: "OpenSSH",
                version: "7.4",
              },
              {
                port: 80,
                protocol: "tcp",
                state: "open",
                service: "http",
                product: "Apache httpd",
                version: "2.4.6",
              },
              {
                port: 443,
                protocol: "tcp",
                state: "closed",
                service: "https",
              },
            ],
          },
          {
            ip: "192.168.1.2",
            status: "up",
            ports: [
              {
                port: 3306,
                protocol: "tcp",
                state: "open",
                service: "mysql",
                product: "MySQL",
                version: "5.7.31",
              },
            ],
          },
        ],
        summary: {
          hostsUp: 2,
          hostsDown: 0,
          totalPorts: 4,
          openPorts: 3,
          closedPorts: 1,
          filteredPorts: 0,
        },
      };

      const vulnerable = extractVulnerableServices(result);

      expect(vulnerable.length).toBe(3);
      expect(vulnerable.some((v) => v.ip === "192.168.1.1" && v.port === 22)).toBe(true);
      expect(vulnerable.some((v) => v.ip === "192.168.1.1" && v.port === 80)).toBe(true);
      expect(vulnerable.some((v) => v.ip === "192.168.1.2" && v.port === 3306)).toBe(true);
      expect(vulnerable.every((v) => v.service)).toBe(true);
    });

    it("should not include closed ports", () => {
      const result: NmapScanResult = {
        target: "localhost",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 10,
        hosts: [
          {
            ip: "127.0.0.1",
            status: "up",
            ports: [
              {
                port: 22,
                protocol: "tcp",
                state: "closed",
                service: "ssh",
              },
              {
                port: 80,
                protocol: "tcp",
                state: "filtered",
                service: "http",
              },
            ],
          },
        ],
        summary: {
          hostsUp: 1,
          hostsDown: 0,
          totalPorts: 2,
          openPorts: 0,
          closedPorts: 1,
          filteredPorts: 1,
        },
      };

      const vulnerable = extractVulnerableServices(result);
      expect(vulnerable.length).toBe(0);
    });

    it("should include product and version information", () => {
      const result: NmapScanResult = {
        target: "192.168.1.1",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 30,
        hosts: [
          {
            ip: "192.168.1.1",
            status: "up",
            ports: [
              {
                port: 22,
                protocol: "tcp",
                state: "open",
                service: "ssh",
                product: "OpenSSH",
                version: "7.4p1",
              },
            ],
          },
        ],
        summary: {
          hostsUp: 1,
          hostsDown: 0,
          totalPorts: 1,
          openPorts: 1,
          closedPorts: 0,
          filteredPorts: 0,
        },
      };

      const vulnerable = extractVulnerableServices(result);
      expect(vulnerable[0].product).toBe("OpenSSH");
      expect(vulnerable[0].version).toBe("7.4p1");
    });
  });
});
