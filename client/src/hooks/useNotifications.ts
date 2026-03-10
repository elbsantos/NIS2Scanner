import { useEffect, useState, useCallback, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";

export interface Notification {
  id: string;
  organizationId: number;
  type: "critical" | "high" | "medium" | "low" | "info";
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

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const organizationIdRef = useRef<number | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    // Get organization ID from localStorage or API
    const orgId = parseInt(localStorage.getItem("organizationId") || "0", 10);
    if (!orgId) return;

    organizationIdRef.current = orgId;

    const socket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[WebSocket] Connected");
      socket.emit("join-organization", {
        organizationId: orgId,
        userId: user.id,
      });
    });

    socket.on("notification", (notification: Notification) => {
      console.log("[WebSocket] Received notification:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
    });

    socket.on("error", (error) => {
      console.error("[WebSocket] Error:", error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setUnreadCount((prev) => {
      const notification = notifications.find((n) => n.id === notificationId);
      return notification && !notification.read ? Math.max(0, prev - 1) : prev;
    });
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    deleteNotification,
    socket: socketRef.current,
  };
}
