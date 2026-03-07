import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  datetime,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  organizationId: int("organizationId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Organizations table - represents companies/PMEs using the scanner
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sector: varchar("sector", { length: 100 }), // e.g., "Healthcare", "Finance", "Energy"
  country: varchar("country", { length: 2 }).default("PT"), // ISO 3166-1 alpha-2
  employees: int("employees"), // Number of employees
  ownerId: int("ownerId").notNull(), // Reference to users table
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Assets table - represents IT assets (servers, networks, etc.)
 */
export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["server", "network", "workstation", "iot", "other"]).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  hostname: varchar("hostname", { length: 255 }),
  description: text("description"),
  criticality: mysqlEnum("criticality", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["active", "inactive", "monitoring"]).default("active"),
  lastScanned: timestamp("lastScanned"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

/**
 * Scans table - represents individual security scans
 */
export const scans = mysqlTable("scans", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  assetId: int("assetId"),
  scanName: varchar("scanName", { length: 255 }).notNull(),
  mode: mysqlEnum("mode", ["sme", "supply"]).notNull(), // SME Mode (basic) or Supply Mode (comprehensive)
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending"),
  startTime: timestamp("startTime"),
  endTime: timestamp("endTime"),
  scanType: mysqlEnum("scanType", ["network", "web", "supply_chain"]).notNull(),
  targetRange: varchar("targetRange", { length: 255 }), // e.g., "192.168.1.0/24" or single IP
  portsScanned: text("portsScanned"), // JSON array of ports
  vulnerabilitiesFound: int("vulnerabilitiesFound").default(0),
  criticalCount: int("criticalCount").default(0),
  highCount: int("highCount").default(0),
  mediumCount: int("mediumCount").default(0),
  lowCount: int("lowCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scan = typeof scans.$inferSelect;
export type InsertScan = typeof scans.$inferInsert;

/**
 * Vulnerabilities table - discovered vulnerabilities from scans
 */
export const vulnerabilities = mysqlTable("vulnerabilities", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  cveId: varchar("cveId", { length: 20 }).notNull(), // e.g., "CVE-2024-1234"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  cvssScore: decimal("cvssScore", { precision: 3, scale: 1 }), // 0.0 to 10.0
  cvssVector: varchar("cvssVector", { length: 255 }), // CVSS:3.1/AV:N/AC:L/...
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low", "info"]).notNull(),
  affectedSoftware: varchar("affectedSoftware", { length: 255 }),
  affectedVersion: varchar("affectedVersion", { length: 100 }),
  publishedDate: datetime("publishedDate"),
  exploitAvailable: boolean("exploitAvailable").default(false),
  exploitUrl: varchar("exploitUrl", { length: 500 }),
  remediationAvailable: boolean("remediationAvailable").default(false),
  remediationDetails: text("remediationDetails"),
  nis2Articles: text("nis2Articles"), // JSON array of applicable NIS2 articles
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = typeof vulnerabilities.$inferInsert;

/**
 * NIS2 Compliance Mappings - maps vulnerabilities to NIS2 articles
 */
export const nis2Mappings = mysqlTable("nis2Mappings", {
  id: int("id").autoincrement().primaryKey(),
  vulnerabilityId: int("vulnerabilityId").notNull(),
  article: varchar("article", { length: 20 }).notNull(), // e.g., "Art. 21", "Art. 28"
  requirement: varchar("requirement", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["compliant", "non_compliant", "partial"]).notNull(),
  riskLevel: mysqlEnum("riskLevel", ["critical", "high", "medium", "low"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NIS2Mapping = typeof nis2Mappings.$inferSelect;
export type InsertNIS2Mapping = typeof nis2Mappings.$inferInsert;

/**
 * Recommendations table - remediation recommendations for vulnerabilities
 */
export const recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  vulnerabilityId: int("vulnerabilityId").notNull(),
  organizationId: int("organizationId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["critical", "high", "medium", "low"]).notNull(),
  estimatedEffort: varchar("estimatedEffort", { length: 50 }), // e.g., "1 hour", "1 day"
  steps: text("steps"), // JSON array of remediation steps in PT-PT
  resources: text("resources"), // JSON array of helpful resources/links
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "ignored"]).default("open"),
  assignedTo: int("assignedTo"), // Reference to users table
  dueDate: datetime("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;

/**
 * Reports table - generated compliance reports
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  scanId: int("scanId"),
  title: varchar("title", { length: 255 }).notNull(),
  reportType: mysqlEnum("reportType", ["executive", "technical", "compliance", "full"]).notNull(),
  format: mysqlEnum("format", ["json", "html", "pdf"]).notNull(),
  content: text("content"), // JSON or HTML content
  complianceScore: decimal("complianceScore", { precision: 3, scale: 1 }), // 0.0 to 100.0
  nis2ArticlesCovered: int("nis2ArticlesCovered"),
  vulnerabilitiesSummary: text("vulnerabilitiesSummary"), // JSON summary
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  expiresAt: datetime("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Notifications table - system alerts for compliance violations
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  userId: int("userId"),
  type: mysqlEnum("type", ["critical_vulnerability", "compliance_violation", "scan_complete", "report_ready"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).notNull(),
  relatedVulnerabilityId: int("relatedVulnerabilityId"),
  relatedScanId: int("relatedScanId"),
  isRead: boolean("isRead").default(false),
  actionUrl: varchar("actionUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Audit Log table - tracks all user actions for compliance
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "scan_started", "report_generated"
  resourceType: varchar("resourceType", { length: 50 }), // e.g., "scan", "asset", "report"
  resourceId: int("resourceId"),
  details: text("details"), // JSON with additional context
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * CVE Cache table - local cache of CVE data from NVD/Vulners
 */
export const cveCache = mysqlTable("cveCache", {
  id: int("id").autoincrement().primaryKey(),
  cveId: varchar("cveId", { length: 20 }).notNull().unique(),
  data: text("data"), // JSON with full CVE data
  source: mysqlEnum("source", ["nvd", "vulners", "both"]).notNull(),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  expiresAt: datetime("expiresAt"),
});

export type CVECache = typeof cveCache.$inferSelect;
export type InsertCVECache = typeof cveCache.$inferInsert;
