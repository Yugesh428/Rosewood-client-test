"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, X, ExternalLink, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

type Notification = {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  actionUrl: string | null;
  actionLabel: string | null;
  isRead: boolean;
  createdAt: string;
};

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";

export default function NotificationBell() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch(`/api/notifications/unread-count?userId=${session.user.id}`);
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.data.count);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${session.user.id}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (session?.user?.id) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.id]);

  // Fetch notifications when opening dropdown
  useEffect(() => {
    if (isOpen && session?.user?.id) {
      fetchNotifications();
    }
  }, [isOpen, session?.user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order": return "#3B82F6";
      case "inventory": return "#F59E0B";
      case "customer": return "#10B981";
      case "support": return "#8B5CF6";
      case "promo": return "#EC4899";
      default: return "#6B7280";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent": return { bg: "#FEE2E2", text: "#DC2626", label: "Urgent" };
      case "high": return { bg: "#FEF3C7", text: "#D97706", label: "High" };
      case "medium": return { bg: "#DBEAFE", text: "#2563EB", label: "Medium" };
      default: return { bg: "#F3F4F6", text: "#6B7280", label: "Low" };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "relative",
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          border: "1px solid rgba(212,175,55,0.2)",
          background: isOpen ? "rgba(212,175,55,0.1)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(212,175,55,0.1)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = "transparent";
        }}
      >
        <Bell
          className="w-5 h-5"
          style={{ color: isOpen ? "#D4AF37" : "#999" }}
        />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              minWidth: "20px",
              height: "20px",
              borderRadius: "10px",
              background: "#DC2626",
              color: "#FFF",
              fontSize: "11px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 6px",
              fontFamily: FM,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              width: "420px",
              maxHeight: "600px",
              background: "#FFF",
              border: "1px solid #E5E5E5",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #E5E5E5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ fontFamily: FM, fontSize: "16px", fontWeight: 700, color: "#1A1A1A", marginBottom: "2px" }}>
                  Notifications
                </h3>
                <p style={{ fontFamily: FM, fontSize: "12px", color: "#6B7280" }}>
                  {unreadCount} unread
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    padding: "6px 12px",
                    background: "transparent",
                    border: "1px solid #D4AF37",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#D4AF37",
                    cursor: "pointer",
                    fontFamily: FM,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div style={{ flex: 1, overflowY: "auto", maxHeight: "500px" }}>
              {loading ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <div style={{ width: "32px", height: "32px", border: "3px solid #E5E5E5", borderTop: "3px solid #D4AF37", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
                  <p style={{ fontFamily: FM, fontSize: "13px", color: "#999" }}>Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: "60px 20px", textAlign: "center" }}>
                  <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: "#E5E5E5" }} />
                  <p style={{ fontFamily: FM, fontSize: "14px", color: "#6B7280" }}>
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const priorityBadge = getPriorityBadge(notification.priority);
                  const typeColor = getTypeColor(notification.type);

                  return (
                    <div
                      key={notification.id}
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #F3F4F6",
                        background: notification.isRead ? "#FFF" : "#FFFBF0",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = notification.isRead ? "#F9FAFB" : "#FFF4E6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = notification.isRead ? "#FFF" : "#FFFBF0";
                      }}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      <div style={{ display: "flex", gap: "12px" }}>
                        {/* Type Indicator */}
                        <div
                          style={{
                            width: "4px",
                            flexShrink: 0,
                            background: typeColor,
                            borderRadius: "2px",
                          }}
                        />

                        <div style={{ flex: 1 }}>
                          {/* Header */}
                          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: "8px" }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontFamily: FM, fontSize: "14px", fontWeight: 600, color: "#1A1A1A", marginBottom: "4px" }}>
                                {notification.title}
                              </h4>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span
                                  style={{
                                    padding: "2px 8px",
                                    background: priorityBadge.bg,
                                    color: priorityBadge.text,
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    borderRadius: "4px",
                                    textTransform: "uppercase",
                                    fontFamily: FM,
                                  }}
                                >
                                  {priorityBadge.label}
                                </span>
                                <span style={{ fontFamily: FM, fontSize: "11px", color: "#9CA3AF" }}>
                                  {formatTime(notification.createdAt)}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              style={{
                                padding: "4px",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: "4px",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#FEE2E2";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              <X className="w-4 h-4" style={{ color: "#6B7280" }} />
                            </button>
                          </div>

                          {/* Message */}
                          <p style={{ fontFamily: FM, fontSize: "13px", color: "#374151", lineHeight: "1.5", marginBottom: "8px" }}>
                            {notification.message}
                          </p>

                          {/* Action Button */}
                          {notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 12px",
                                background: "#D4AF37",
                                color: "#1A1A1A",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 600,
                                textDecoration: "none",
                                fontFamily: FM,
                              }}
                            >
                              {notification.actionLabel || "View"}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
