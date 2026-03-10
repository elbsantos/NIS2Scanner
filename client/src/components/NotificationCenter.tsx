import { useState } from "react";
import { Bell, X, AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type Notification } from "@/hooks/useNotifications";

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, deleteNotification, clearNotifications } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "high":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case "medium":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "low":
        return <Info className="w-4 h-4 text-blue-600" />;
      case "info":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "high":
        return "bg-orange-50 border-orange-200";
      case "medium":
        return "bg-yellow-50 border-yellow-200";
      case "low":
        return "bg-blue-50 border-blue-200";
      case "info":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getBadgeVariant = (type: Notification["type"]) => {
    switch (type) {
      case "critical":
        return "destructive";
      case "high":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-0 right-0 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="text-xs text-gray-500"
            >
              Limpar tudo
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-2 p-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${getTypeColor(notification.type)} cursor-pointer transition-colors hover:opacity-80 ${
                    !notification.read ? "border-l-4" : ""
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <Badge variant={getBadgeVariant(notification.type)} className="text-xs">
                            {notification.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.cveId && (
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-mono">{notification.cveId}</span>
                            {notification.cvssScore && (
                              <span className="ml-2">
                                CVSS: <span className="font-semibold">{notification.cvssScore}</span>
                              </span>
                            )}
                          </p>
                        )}
                        {notification.nis2Articles && notification.nis2Articles.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            NIS2: {notification.nis2Articles.join(", ")}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleString("pt-PT")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
