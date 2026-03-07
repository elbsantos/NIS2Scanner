import { describe, it, expect } from "vitest";
import {
  parseCVSSVector,
  determineSeverity,
  assessExploitability,
  assessImpactLevel,
  assessRisk,
  mapToNIS2Articles,
  generateNIS2Requirement,
  assessBusinessImpact,
  determineRemediationUrgency,
  generateRemediationSteps,
} from "./risk-analyzer";

describe("Risk Analyzer Module", () => {
  describe("parseCVSSVector", () => {
    it("should parse valid CVSS 3.1 vector", () => {
      const vector = parseCVSSVector("CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H");
      expect(vector).toEqual({
        version: "3.1",
        av: "N",
        ac: "L",
        pr: "N",
        ui: "N",
        s: "U",
        c: "H",
        i: "H",
        a: "H",
      });
    });

    it("should return null for invalid vector", () => {
      const vector = parseCVSSVector("invalid");
      expect(vector).toBeNull();
    });
  });

  describe("determineSeverity", () => {
    it("should return critical for score >= 9.0", () => {
      expect(determineSeverity(9.5)).toBe("critical");
      expect(determineSeverity(10.0)).toBe("critical");
    });

    it("should return high for score 7.0-8.9", () => {
      expect(determineSeverity(7.0)).toBe("high");
      expect(determineSeverity(8.5)).toBe("high");
    });

    it("should return medium for score 4.0-6.9", () => {
      expect(determineSeverity(4.0)).toBe("medium");
      expect(determineSeverity(6.5)).toBe("medium");
    });

    it("should return low for score 0.1-3.9", () => {
      expect(determineSeverity(0.1)).toBe("low");
      expect(determineSeverity(3.9)).toBe("low");
    });

    it("should return info for score 0", () => {
      expect(determineSeverity(0)).toBe("info");
    });
  });

  describe("assessExploitability", () => {
    it("should assess high exploitability for network attack with no auth", () => {
      const vector = {
        version: "3.1",
        av: "N",
        ac: "L",
        pr: "N",
        ui: "N",
        s: "U",
        c: "H",
        i: "H",
        a: "H",
      };
      expect(assessExploitability(vector)).toBe("high");
    });

    it("should assess low exploitability for physical attack with high auth", () => {
      const vector = {
        version: "3.1",
        av: "P",
        ac: "H",
        pr: "H",
        ui: "R",
        s: "U",
        c: "L",
        i: "L",
        a: "L",
      };
      expect(assessExploitability(vector)).toBe("low");
    });

    it("should handle null vector", () => {
      expect(assessExploitability(null)).toBe("medium");
    });
  });

  describe("assessImpactLevel", () => {
    it("should assess high impact for multiple high impact metrics", () => {
      const vector = {
        version: "3.1",
        av: "N",
        ac: "L",
        pr: "N",
        ui: "N",
        s: "U",
        c: "H",
        i: "H",
        a: "H",
      };
      expect(assessImpactLevel(vector)).toBe("high");
    });

    it("should assess low impact for all low metrics", () => {
      const vector = {
        version: "3.1",
        av: "N",
        ac: "L",
        pr: "N",
        ui: "N",
        s: "U",
        c: "N",
        i: "N",
        a: "N",
      };
      expect(assessImpactLevel(vector)).toBe("low");
    });
  });

  describe("mapToNIS2Articles", () => {
    it("should map authentication vulnerabilities to Art. 21.1(a)", () => {
      const articles = mapToNIS2Articles("SQL injection in authentication module", 7.5, "high");
      expect(articles).toContain("Art. 21");
      expect(articles).toContain("Art. 21.1(a)");
    });

    it("should map encryption vulnerabilities to Art. 21.1(b)", () => {
      const articles = mapToNIS2Articles("Weak SSL/TLS encryption", 6.5, "medium");
      expect(articles).toContain("Art. 21.1(b)");
    });

    it("should map availability issues to Art. 21.1(c)", () => {
      const articles = mapToNIS2Articles("Denial of Service vulnerability", 7.5, "high");
      expect(articles).toContain("Art. 21.1(c)");
    });

    it("should map high severity to Art. 28", () => {
      const articles = mapToNIS2Articles("Critical vulnerability", 8.5, "high");
      expect(articles).toContain("Art. 28");
    });
  });

  describe("determineSeverity", () => {
    it("should return immediate for critical risk", () => {
      expect(determineRemediationUrgency("critical", false)).toBe("immediate");
    });

    it("should return immediate for high risk with exploit", () => {
      expect(determineRemediationUrgency("high", true)).toBe("immediate");
    });

    it("should return urgent for high risk without exploit", () => {
      expect(determineRemediationUrgency("high", false)).toBe("urgent");
    });

    it("should return soon for medium risk", () => {
      expect(determineRemediationUrgency("medium", false)).toBe("soon");
    });

    it("should return planned for low risk", () => {
      expect(determineRemediationUrgency("low", false)).toBe("planned");
    });
  });

  describe("generateRemediationSteps", () => {
    it("should generate authentication-specific steps", () => {
      const steps = generateRemediationSteps("Authentication bypass vulnerability", "high");
      expect(steps.some((s) => s.includes("Forçar redefinição"))).toBe(true);
      expect(steps.some((s) => s.includes("MFA"))).toBe(true);
    });

    it("should generate encryption-specific steps", () => {
      const steps = generateRemediationSteps("Weak SSL/TLS encryption", "high");
      expect(steps.some((s) => s.includes("SSL/TLS"))).toBe(true);
    });

    it("should generate RCE-specific steps", () => {
      const steps = generateRemediationSteps("Remote code execution vulnerability", "critical");
      expect(steps.some((s) => s.includes("Isolar"))).toBe(true);
      expect(steps.some((s) => s.includes("backup"))).toBe(true);
    });
  });

  describe("assessRisk", () => {
    it("should perform comprehensive risk assessment", () => {
      const assessment = assessRisk(
        9.5,
        "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
        "Remote code execution in authentication module",
        true
      );

      expect(assessment.cvssScore).toBe(9.5);
      expect(assessment.severity).toBe("critical");
      expect(assessment.riskLevel).toBe("critical");
      expect(assessment.exploitability).toBe("high");
      expect(assessment.impactLevel).toBe("high");
      expect(assessment.nis2Articles).toContain("Art. 21");
      expect(assessment.remediationUrgency).toBe("immediate");
    });

    it("should handle medium severity vulnerability", () => {
      const assessment = assessRisk(
        5.5,
        "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:L/A:N",
        "Information disclosure in user profile",
        false
      );

      expect(assessment.severity).toBe("medium");
      expect(assessment.riskLevel).toBe("medium");
      expect(assessment.remediationUrgency).toBe("soon");
    });
  });
});
