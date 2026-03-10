import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

export type NotificationType = "critical" | "high" | "medium" | "low" | "info";

export interface Notification {
  id: string;
  organizationId: number;
  type: NotificationType;
  title: string;
  message: string;
  cveId?: string;
  severity?: string;
  cvssScore?: number;
  nis2Articles?: string[];
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  cveId?: string;
  severity?: string;
  cvssScore?: number;
  nis2Articles?: string[];
  actionUrl?: string;
}

class WebSocketManager {
  private io: SocketIOServer | null = null;
  private userSockets: Map<number, Set<string>> = new Map();
  private organizationSockets: Map<number, Set<string>> = new Map();

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    this.io.on("connection", (socket) => {
      console.log(`[WebSocket] User connected: ${socket.id}`);

      socket.on("join-organization", (data: { organizationId: number; userId: number }) => {
        const { organizationId, userId } = data;

        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socket.id);

        if (!this.organizationSockets.has(organizationId)) {
          this.organizationSockets.set(organizationId, new Set());
        }
        this.organizationSockets.get(organizationId)!.add(socket.id);

        socket.join(`org-${organizationId}`);
        socket.join(`user-${userId}`);

        console.log(
          `[WebSocket] User ${userId} joined organization ${organizationId} on socket ${socket.id}`
        );
      });

      socket.on("disconnect", () => {
        console.log(`[WebSocket] User disconnected: ${socket.id}`);

        this.userSockets.forEach((sockets) => {
          sockets.delete(socket.id);
        });

        this.organizationSockets.forEach((sockets) => {
          sockets.delete(socket.id);
        });
      });

      socket.on("error", (error) => {
        console.error(`[WebSocket] Socket error:`, error);
      });
    });

    return this.io;
  }

  notifyOrganization(organizationId: number, notification: NotificationPayload) {
    if (!this.io) {
      console.warn("[WebSocket] Socket.IO not initialized");
      return;
    }

    const payload: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      cveId: notification.cveId,
      severity: notification.severity,
      cvssScore: notification.cvssScore,
      nis2Articles: notification.nis2Articles,
      timestamp: new Date(),
      read: false,
      actionUrl: notification.actionUrl,
    };

    this.io.to(`org-${organizationId}`).emit("notification", payload);
    console.log(
      `[WebSocket] Notification sent to organization ${organizationId}:`,
      payload.title
    );
  }

  notifyUser(userId: number, notification: NotificationPayload) {
    if (!this.io) {
      console.warn("[WebSocket] Socket.IO not initialized");
      return;
    }

    const payload: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      organizationId: 0,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      cveId: notification.cveId,
      severity: notification.severity,
      cvssScore: notification.cvssScore,
      nis2Articles: notification.nis2Articles,
      timestamp: new Date(),
      read: false,
      actionUrl: notification.actionUrl,
    };

    this.io.to(`user-${userId}`).emit("notification", payload);
    console.log(`[WebSocket] Notification sent to user ${userId}:`, payload.title);
  }

  broadcastVulnerabilityAlert(
    organizationId: number,
    cveId: string,
    severity: string,
    cvssScore: number,
    nis2Articles: string[]
  ) {
    this.notifyOrganization(organizationId, {
      type: severity === "critical" ? "critical" : severity === "high" ? "high" : "medium",
      title: `Vulnerabilidade ${severity.toUpperCase()} Detectada`,
      message: `CVE ${cveId} com score CVSS ${cvssScore} foi descoberta durante o scan de segurança.`,
      cveId,
      severity,
      cvssScore,
      nis2Articles,
      actionUrl: `/scans?cve=${cveId}`,
    });
  }

  broadcastComplianceAlert(organizationId: number, message: string, nis2Articles: string[]) {
    this.notifyOrganization(organizationId, {
      type: "high",
      title: "Alerta de Conformidade NIS2",
      message,
      nis2Articles,
    });
  }

  getIO() {
    return this.io;
  }
}

export const wsManager = new WebSocketManager();
