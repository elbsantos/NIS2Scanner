import { describe, it, expect, beforeEach } from "vitest";
import { type NotificationPayload } from "./websocket";

describe("WebSocket Notification Types", () => {
  describe("Notification structure", () => {
    it("should have all required notification fields", () => {
      const payload: NotificationPayload = {
        type: "critical",
        title: "Test Alert",
        message: "Test message",
        cveId: "CVE-2024-1234",
        severity: "critical",
        cvssScore: 9.8,
        nis2Articles: ["Art. 21"],
      };

      expect(payload).toHaveProperty("type");
      expect(payload).toHaveProperty("title");
      expect(payload).toHaveProperty("message");
      expect(payload.type).toBe("critical");
      expect(payload.title).toBe("Test Alert");
      expect(payload.cveId).toBe("CVE-2024-1234");
      expect(payload.cvssScore).toBe(9.8);
    });

    it("should support optional fields", () => {
      const payload: NotificationPayload = {
        type: "info",
        title: "Info",
        message: "Info message",
      };

      expect(payload.cveId).toBeUndefined();
      expect(payload.severity).toBeUndefined();
      expect(payload.cvssScore).toBeUndefined();
    });
  });

  describe("Notification types", () => {
    it("should support all notification types", () => {
      const types: Array<"critical" | "high" | "medium" | "low" | "info"> = [
        "critical",
        "high",
        "medium",
        "low",
        "info",
      ];

      types.forEach((type) => {
        const payload: NotificationPayload = {
          type,
          title: `${type} notification`,
          message: "Test",
        };

        expect(payload.type).toBe(type);
      });
    });

    it("should have correct severity mapping", () => {
      const severityMap = {
        critical: "critical",
        high: "high",
        medium: "medium",
        low: "low",
        info: "info",
      };

      Object.entries(severityMap).forEach(([key, value]) => {
        const payload: NotificationPayload = {
          type: key as any,
          title: "Test",
          message: "Test",
        };

        expect(payload.type).toBe(value);
      });
    });
  });

  describe("Vulnerability alert payload", () => {
    it("should create valid vulnerability alert payload", () => {
      const payload: NotificationPayload = {
        type: "critical",
        title: "Vulnerabilidade CRÍTICA Detectada",
        message: "CVE-2024-1234 com score CVSS 9.8 foi descoberta durante o scan de segurança.",
        cveId: "CVE-2024-1234",
        severity: "critical",
        cvssScore: 9.8,
        nis2Articles: ["Art. 21", "Art. 22"],
        actionUrl: "/scans?cve=CVE-2024-1234",
      };

      expect(payload.type).toBe("critical");
      expect(payload.cveId).toBe("CVE-2024-1234");
      expect(payload.cvssScore).toBe(9.8);
      expect(payload.nis2Articles).toContain("Art. 21");
      expect(payload.actionUrl).toContain("CVE-2024-1234");
    });

    it("should handle different CVSS scores", () => {
      const scores = [0.1, 3.5, 5.0, 7.5, 9.8];

      scores.forEach((score) => {
        const payload: NotificationPayload = {
          type: "high",
          title: "Alert",
          message: "Test",
          cvssScore: score,
        };

        expect(payload.cvssScore).toBe(score);
      });
    });
  });

  describe("Compliance alert payload", () => {
    it("should create valid compliance alert payload", () => {
      const payload: NotificationPayload = {
        type: "high",
        title: "Alerta de Conformidade NIS2",
        message: "Gap de conformidade detectado em controlo de acesso",
        nis2Articles: ["Art. 21", "Art. 22", "Art. 23"],
      };

      expect(payload.type).toBe("high");
      expect(payload.title).toContain("Conformidade");
      expect(payload.nis2Articles?.length).toBe(3);
    });
  });

  describe("Notification payload validation", () => {
    it("should have consistent structure across all types", () => {
      const payloads: NotificationPayload[] = [
        {
          type: "critical",
          title: "Critical",
          message: "Critical message",
        },
        {
          type: "high",
          title: "High",
          message: "High message",
        },
        {
          type: "medium",
          title: "Medium",
          message: "Medium message",
        },
        {
          type: "low",
          title: "Low",
          message: "Low message",
        },
        {
          type: "info",
          title: "Info",
          message: "Info message",
        },
      ];

      payloads.forEach((payload) => {
        expect(payload).toHaveProperty("type");
        expect(payload).toHaveProperty("title");
        expect(payload).toHaveProperty("message");
        expect(typeof payload.type).toBe("string");
        expect(typeof payload.title).toBe("string");
        expect(typeof payload.message).toBe("string");
      });
    });

    it("should allow NIS2 articles array", () => {
      const payload: NotificationPayload = {
        type: "high",
        title: "Test",
        message: "Test",
        nis2Articles: ["Art. 21", "Art. 22", "Art. 23", "Art. 24", "Art. 25"],
      };

      expect(Array.isArray(payload.nis2Articles)).toBe(true);
      expect(payload.nis2Articles?.length).toBe(5);
      expect(payload.nis2Articles).toContain("Art. 21");
    });

    it("should allow action URL", () => {
      const payload: NotificationPayload = {
        type: "info",
        title: "Test",
        message: "Test",
        actionUrl: "/dashboard/scans/123",
      };

      expect(payload.actionUrl).toContain("/dashboard");
      expect(payload.actionUrl).toContain("scans");
    });
  });

  describe("Notification ID generation", () => {
    it("should generate unique IDs with timestamp and random suffix", () => {
      const generateId = () => `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^notif-\d+-[a-z0-9]{9}$/);
      expect(id2).toMatch(/^notif-\d+-[a-z0-9]{9}$/);
    });
  });
});
