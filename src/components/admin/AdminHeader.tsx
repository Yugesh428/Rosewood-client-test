"use client";

import { useSession } from "next-auth/react";
import NotificationBell from "./NotificationBell";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "#FFFFFF",
        borderBottom: "1px solid #E5E5E5",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left: Page indicator or breadcrumb (can be customized per page) */}
      <div>
        <p style={{ fontFamily: FM, fontSize: "14px", color: "#6B7280" }}>
          Welcome back, <strong style={{ color: "#1A1A1A" }}>{session?.user?.name || "Admin"}</strong>
        </p>
      </div>

      {/* Right: Notifications + User Menu */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <NotificationBell />

        {/* User Avatar */}
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1A1A1A",
            fontWeight: 700,
            fontSize: "14px",
            fontFamily: FM,
            border: "2px solid rgba(212,175,55,0.2)",
          }}
        >
          {session?.user?.name?.charAt(0).toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
}
