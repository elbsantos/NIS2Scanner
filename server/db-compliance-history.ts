import { getDb } from "./db";
import {
  complianceImprovementActions,
  complianceSnapshots,
  complianceTrends,
  type InsertComplianceImprovementAction,
  type InsertComplianceSnapshot,
  type InsertComplianceTrend,
} from "../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { desc as descOrder } from "drizzle-orm/sql";

// Use desc for ordering

/**
 * Create a compliance improvement action
 */
export async function createComplianceAction(
  action: InsertComplianceImprovementAction
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(complianceImprovementActions).values(action);
  return result;
}

/**
 * Get compliance actions for an organization
 */
export async function getComplianceActionsByOrganization(
  organizationId: number,
  status?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [eq(complianceImprovementActions.organizationId, organizationId)];
  if (status) {
    conditions.push(eq(complianceImprovementActions.status, status as any));
  }

  const result = await db
    .select()
    .from(complianceImprovementActions)
    .where(and(...conditions))
    .orderBy(desc(complianceImprovementActions.createdAt));

  return result;
}

/**
 * Update compliance action status
 */
export async function updateComplianceActionStatus(
  actionId: number,
  status: string,
  actualEffort?: string,
  actualImpact?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === "completed") {
    updateData.completedAt = new Date();
  }

  if (actualEffort) {
    updateData.actualEffort = actualEffort;
  }

  if (actualImpact) {
    updateData.actualImpact = actualImpact;
  }

  const result = await db
    .update(complianceImprovementActions)
    .set(updateData)
    .where(eq(complianceImprovementActions.id, actionId));

  return result;
}

/**
 * Create a compliance snapshot (baseline, before/after action, periodic)
 */
export async function createComplianceSnapshot(
  snapshot: InsertComplianceSnapshot
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(complianceSnapshots).values(snapshot);
  return result;
}

/**
 * Get compliance snapshots for an organization
 */
export async function getComplianceSnapshotsByOrganization(
  organizationId: number,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(complianceSnapshots)
    .where(eq(complianceSnapshots.organizationId, organizationId))
    .orderBy(desc(complianceSnapshots.createdAt))
    .limit(limit);

  return result;
}

/**
 * Get compliance snapshots for a specific action (before/after)
 */
export async function getComplianceSnapshotsForAction(actionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(complianceSnapshots)
    .where(eq(complianceSnapshots.actionId, actionId))
    .orderBy(complianceSnapshots.createdAt);

  return result;
}

/**
 * Get baseline snapshot for an organization
 */
export async function getBaselineSnapshot(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(complianceSnapshots)
    .where(
      and(
        eq(complianceSnapshots.organizationId, organizationId),
        eq(complianceSnapshots.snapshotType, "baseline")
      )
    )
    .orderBy(complianceSnapshots.createdAt)
    .limit(1);

  return result[0] || null;
}

/**
 * Create or update compliance trend for a month
 */
export async function upsertComplianceTrend(trend: InsertComplianceTrend) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(complianceTrends)
    .where(
      and(
        eq(complianceTrends.organizationId, trend.organizationId),
        eq(complianceTrends.month, trend.month!)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const result = await db
      .update(complianceTrends)
      .set(trend)
      .where(
        and(
          eq(complianceTrends.organizationId, trend.organizationId),
          eq(complianceTrends.month, trend.month!)
        )
      );
    return result;
  } else {
    const result = await db.insert(complianceTrends).values(trend);
    return result;
  }
}

/**
 * Get compliance trends for an organization
 */
export async function getComplianceTrendsByOrganization(
  organizationId: number,
  monthsBack: number = 12
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(complianceTrends)
    .where(eq(complianceTrends.organizationId, organizationId))
    .orderBy(complianceTrends.month)
    .limit(monthsBack);

  return result;
}

/**
 * Calculate compliance improvement (before/after)
 */
export async function calculateComplianceImprovement(
  organizationId: number,
  actionId: number
) {
  const snapshots = await getComplianceSnapshotsForAction(actionId);

  if (snapshots.length < 2) {
    return null;
  }

  const before = snapshots[0];
  const after = snapshots[snapshots.length - 1];

  return {
    nis2Improvement:
      after.nis2Score && before.nis2Score
        ? parseFloat(after.nis2Score.toString()) -
          parseFloat(before.nis2Score.toString())
        : 0,
    iso27001Improvement:
      after.iso27001Score && before.iso27001Score
        ? parseFloat(after.iso27001Score.toString()) -
          parseFloat(before.iso27001Score.toString())
        : 0,
    mitreAttackImprovement:
      after.mitreAttackCoverage && before.mitreAttackCoverage
        ? parseFloat(after.mitreAttackCoverage.toString()) -
          parseFloat(before.mitreAttackCoverage.toString())
        : 0,
    vulnerabilitiesResolved:
      before.vulnerabilityCount && after.vulnerabilityCount
        ? before.vulnerabilityCount - after.vulnerabilityCount
        : 0,
    criticalVulnerabilitiesResolved:
      before.criticalVulnerabilities && after.criticalVulnerabilities
        ? before.criticalVulnerabilities - after.criticalVulnerabilities
        : 0,
  };
}

/**
 * Get overall compliance progress
 */
export async function getComplianceProgress(organizationId: number) {
  const baseline = await getBaselineSnapshot(organizationId);
  const latest = await getComplianceSnapshotsByOrganization(organizationId, 1);

  if (!baseline || latest.length === 0) {
    return null;
  }

  const current = latest[0];

  return {
    baseline: {
      nis2Score: baseline.nis2Score ? parseFloat(baseline.nis2Score.toString()) : 0,
      iso27001Score: baseline.iso27001Score
        ? parseFloat(baseline.iso27001Score.toString())
        : 0,
      mitreAttackCoverage: baseline.mitreAttackCoverage
        ? parseFloat(baseline.mitreAttackCoverage.toString())
        : 0,
      vulnerabilityCount: baseline.vulnerabilityCount || 0,
      criticalVulnerabilities: baseline.criticalVulnerabilities || 0,
    },
    current: {
      nis2Score: current.nis2Score ? parseFloat(current.nis2Score.toString()) : 0,
      iso27001Score: current.iso27001Score
        ? parseFloat(current.iso27001Score.toString())
        : 0,
      mitreAttackCoverage: current.mitreAttackCoverage
        ? parseFloat(current.mitreAttackCoverage.toString())
        : 0,
      vulnerabilityCount: current.vulnerabilityCount || 0,
      criticalVulnerabilities: current.criticalVulnerabilities || 0,
    },
    improvement: {
      nis2: current.nis2Score && baseline.nis2Score
        ? parseFloat(current.nis2Score.toString()) -
          parseFloat(baseline.nis2Score.toString())
        : 0,
      iso27001: current.iso27001Score && baseline.iso27001Score
        ? parseFloat(current.iso27001Score.toString()) -
          parseFloat(baseline.iso27001Score.toString())
        : 0,
      mitreAttack: current.mitreAttackCoverage && baseline.mitreAttackCoverage
        ? parseFloat(current.mitreAttackCoverage.toString()) -
          parseFloat(baseline.mitreAttackCoverage.toString())
        : 0,
      vulnerabilities:
        (baseline.vulnerabilityCount || 0) - (current.vulnerabilityCount || 0),
      criticalVulnerabilities:
        (baseline.criticalVulnerabilities || 0) -
        (current.criticalVulnerabilities || 0),
    },
  };
}
