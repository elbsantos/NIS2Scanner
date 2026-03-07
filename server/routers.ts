import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getOrganizationByOwnerId,
  createOrganization,
  getAssetsByOrganization,
  createAsset,
  getScansByOrganization,
  createScan,
  updateScanStatus,
  getVulnerabilitiesByScan,
  getRecommendationsByOrganization,
  createRecommendation,
  getReportsByOrganization,
  createReport,
  getNotificationsByOrganization,
  markNotificationAsRead,
  createAuditLog,
  getNIS2MappingsByVulnerability,
} from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Organization endpoints
  organization: router({
    getOrCreate: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          sector: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getOrganizationByOwnerId(ctx.user.id);
        if (existing) {
          return existing;
        }

        const org = await createOrganization({
          name: input.name || `${ctx.user.name}'s Organization`,
          sector: input.sector,
          ownerId: ctx.user.id,
          country: "PT",
        });

        return org;
      }),

    get: protectedProcedure.query(async ({ ctx }) => {
      return getOrganizationByOwnerId(ctx.user.id);
    }),
  }),

  // Asset management endpoints
  assets: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const org = await getOrganizationByOwnerId(ctx.user.id);
      if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

      return getAssetsByOrganization(org.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          type: z.enum(["server", "network", "workstation", "iot", "other"]),
          ipAddress: z.string().optional(),
          hostname: z.string().optional(),
          description: z.string().optional(),
          criticality: z.enum(["low", "medium", "high", "critical"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const org = await getOrganizationByOwnerId(ctx.user.id);
        if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

        const result = await createAsset({
          organizationId: org.id,
          name: input.name,
          type: input.type,
          ipAddress: input.ipAddress,
          hostname: input.hostname,
          description: input.description,
          criticality: input.criticality || "medium",
        });

        // Log audit
        await createAuditLog({
          organizationId: org.id,
          userId: ctx.user.id,
          action: "asset_created",
          resourceType: "asset",
          details: JSON.stringify(input),
        });

        return result;
      }),
  }),

  // Scan management endpoints
  scans: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const org = await getOrganizationByOwnerId(ctx.user.id);
      if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

      return getScansByOrganization(org.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          scanName: z.string(),
          mode: z.enum(["sme", "supply"]),
          scanType: z.enum(["network", "web", "supply_chain"]),
          targetRange: z.string(),
          assetId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const org = await getOrganizationByOwnerId(ctx.user.id);
        if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

        const result = await createScan({
          organizationId: org.id,
          scanName: input.scanName,
          mode: input.mode,
          scanType: input.scanType,
          targetRange: input.targetRange,
          assetId: input.assetId,
          status: "pending",
        });

        // Log audit
        await createAuditLog({
          organizationId: org.id,
          userId: ctx.user.id,
          action: "scan_created",
          resourceType: "scan",
          details: JSON.stringify(input),
        });

        return result;
      }),

    getDetails: protectedProcedure
      .input(z.object({ scanId: z.number() }))
      .query(async ({ ctx, input }) => {
        const org = await getOrganizationByOwnerId(ctx.user.id);
        if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

        const vulnerabilities = await getVulnerabilitiesByScan(input.scanId);
        return {
          vulnerabilities,
          summary: {
            total: vulnerabilities.length,
            critical: vulnerabilities.filter((v) => v.severity === "critical").length,
            high: vulnerabilities.filter((v) => v.severity === "high").length,
            medium: vulnerabilities.filter((v) => v.severity === "medium").length,
            low: vulnerabilities.filter((v) => v.severity === "low").length,
          },
        };
      }),
  }),

  // Recommendations endpoints
  recommendations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const org = await getOrganizationByOwnerId(ctx.user.id);
      if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

      return getRecommendationsByOrganization(org.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          vulnerabilityId: z.number(),
          title: z.string(),
          description: z.string(),
          priority: z.enum(["critical", "high", "medium", "low"]),
          steps: z.array(z.string()),
          resources: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const org = await getOrganizationByOwnerId(ctx.user.id);
        if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

        const result = await createRecommendation({
          organizationId: org.id,
          vulnerabilityId: input.vulnerabilityId,
          title: input.title,
          description: input.description,
          priority: input.priority,
          steps: JSON.stringify(input.steps),
          resources: input.resources ? JSON.stringify(input.resources) : undefined,
          status: "open",
        });

        return result;
      }),
  }),

  // Reports endpoints
  reports: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const org = await getOrganizationByOwnerId(ctx.user.id);
      if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

      return getReportsByOrganization(org.id);
    }),

    generate: protectedProcedure
      .input(
        z.object({
          scanId: z.number(),
          reportType: z.enum(["executive", "technical", "compliance", "full"]),
          format: z.enum(["json", "html", "pdf"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const org = await getOrganizationByOwnerId(ctx.user.id);
        if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

        // Placeholder for report generation logic
        const result = await createReport({
          organizationId: org.id,
          scanId: input.scanId,
          title: `Relatório NIS2 - ${new Date().toLocaleDateString("pt-PT")}`,
          reportType: input.reportType,
          format: input.format,
          content: JSON.stringify({ placeholder: true }),
          complianceScore: 65.5 as any,
          nis2ArticlesCovered: 12,
        });

        // Log audit
        await createAuditLog({
          organizationId: org.id,
          userId: ctx.user.id,
          action: "report_generated",
          resourceType: "report",
          details: JSON.stringify(input),
        });

        return result;
      }),
  }),

  // Notifications endpoints
  notifications: router({
    list: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().optional() }))
      .query(async ({ ctx, input }) => {
        const org = await getOrganizationByOwnerId(ctx.user.id);
        if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

        return getNotificationsByOrganization(org.id, input.unreadOnly);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        return markNotificationAsRead(input.notificationId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
