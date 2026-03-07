import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  organizations,
  assets,
  scans,
  vulnerabilities,
  recommendations,
  reports,
  notifications,
  auditLogs,
  cveCache,
  nis2Mappings,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Organization helpers
export async function getOrganizationByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(organizations)
    .where(eq(organizations.ownerId, ownerId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createOrganization(org: typeof organizations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(organizations).values(org);
  return result;
}

// Asset helpers
export async function getAssetsByOrganization(organizationId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(assets).where(eq(assets.organizationId, organizationId));
}

export async function createAsset(asset: typeof assets.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(assets).values(asset);
  return result;
}

// Scan helpers
export async function getScansByOrganization(organizationId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(scans)
    .where(eq(scans.organizationId, organizationId))
    .orderBy(desc(scans.createdAt))
    .limit(limit);
}

export async function createScan(scan: typeof scans.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scans).values(scan);
  return result;
}

export async function updateScanStatus(
  scanId: number,
  status: typeof scans.$inferSelect["status"]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(scans).set({ status }).where(eq(scans.id, scanId));
}

// Vulnerability helpers
export async function getVulnerabilitiesByScan(scanId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(vulnerabilities)
    .where(eq(vulnerabilities.scanId, scanId))
    .orderBy(desc(vulnerabilities.cvssScore));
}

export async function createVulnerability(vuln: typeof vulnerabilities.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(vulnerabilities).values(vuln);
  return result;
}

// Recommendation helpers
export async function getRecommendationsByOrganization(organizationId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(recommendations)
    .where(eq(recommendations.organizationId, organizationId))
    .orderBy(desc(recommendations.priority));
}

export async function createRecommendation(rec: typeof recommendations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(recommendations).values(rec);
  return result;
}

// Report helpers
export async function getReportsByOrganization(organizationId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(reports)
    .where(eq(reports.organizationId, organizationId))
    .orderBy(desc(reports.generatedAt));
}

export async function createReport(report: typeof reports.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reports).values(report);
  return result;
}

// Notification helpers
export async function getNotificationsByOrganization(organizationId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(notifications.organizationId, organizationId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }

  return db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt));
}

export async function createNotification(notif: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(notif);
  return result;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

// Audit log helpers
export async function createAuditLog(log: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(auditLogs).values(log);
  return result;
}

// CVE Cache helpers
export async function getCVEFromCache(cveId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(cveCache)
    .where(eq(cveCache.cveId, cveId))
    .limit(1);

  if (result.length === 0) return null;

  const cached = result[0];
  // Check if cache is expired
  if (cached.expiresAt && new Date(cached.expiresAt) < new Date()) {
    return null;
  }

  return cached;
}

export async function cacheCVE(
  cveId: string,
  data: Record<string, unknown>,
  source: "nvd" | "vulners" | "both",
  expiresInDays = 30
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const result = await db
    .insert(cveCache)
    .values({
      cveId,
      data: JSON.stringify(data),
      source,
      expiresAt,
    })
    .onDuplicateKeyUpdate({
      set: {
        data: JSON.stringify(data),
        source,
        expiresAt,
        lastUpdated: new Date(),
      },
    });

  return result;
}

// NIS2 Mapping helpers
export async function getNIS2MappingsByVulnerability(vulnerabilityId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(nis2Mappings)
    .where(eq(nis2Mappings.vulnerabilityId, vulnerabilityId));
}

export async function createNIS2Mapping(mapping: typeof nis2Mappings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(nis2Mappings).values(mapping);
  return result;
}
