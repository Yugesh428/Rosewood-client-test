"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, AlertCircle, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

type SupportTicket = {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  message: string;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function MySupportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState<SupportTicket | null>(null);
  const [trackingError, setTrackingError] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "authenticated" && session?.user?.email) {
      fetchMyTickets();
    } else {
      setLoading(false);
    }
  }, [status, session]);

  async function fetchMyTickets() {
    setLoading(true);
    try {
      const res = await fetch("/api/support/my-tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTrackTicket(e: React.FormEvent) {
    e.preventDefault();
    setTrackingError("");
    setTrackingResult(null);
    setTrackingLoading(true);

    try {
      const res = await fetch("/api/support/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketNumber: trackingNumber.trim() }),
      });

      if (res.ok) {
        const ticket = await res.json();
        setTrackingResult(ticket);
      } else {
        const data = await res.json();
        setTrackingError(data.error || "Ticket not found");
      }
    } catch (error) {
      setTrackingError("Failed to track ticket. Please try again.");
    } finally {
      setTrackingLoading(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "open": return <AlertCircle size={16} />;
      case "in_progress": return <Clock size={16} />;
      case "resolved": return <CheckCircle size={16} />;
      case "closed": return <XCircle size={16} />;
      default: return null;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "open": return "#2563EB";
      case "in_progress": return "#CA8A04";
      case "resolved": return "#16A34A";
      case "closed": return "#6B6B6B";
      default: return "#6B6B6B";
    }
  }

  function getStatusLabel(status: string) {
    return status.replace("_", " ").toUpperCase();
  }

  const TicketCard = ({ ticket }: { ticket: SupportTicket }) => {
    const isExpanded = expandedTicket === ticket.id;

    return (
      <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
        <button
          onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
          style={{ width: "100%", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#D4AF37", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                {ticket.ticketNumber}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "12px", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", color: getStatusColor(ticket.status), background: `${getStatusColor(ticket.status)}15` }}>
                {getStatusIcon(ticket.status)}
                {getStatusLabel(ticket.status)}
              </span>
            </div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#1A1A1A", marginBottom: "4px", fontFamily: "var(--font-heading)" }}>
              {ticket.subject}
            </div>
            <div style={{ fontSize: "13px", color: "#6B6B6B", fontFamily: "var(--font-montserrat)" }}>
              {ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}
            </div>
          </div>
          {isExpanded ? <ChevronUp size={20} color="#6B6B6B" /> : <ChevronDown size={20} color="#6B6B6B" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ borderTop: "1px solid #E5E5E5", overflow: "hidden" }}
            >
              <div style={{ padding: "20px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-montserrat)" }}>
                    Your Message
                  </div>
                  <div style={{ fontSize: "14px", color: "#1A1A1A", lineHeight: "1.6", padding: "12px", background: "#F9F9F9", borderRadius: "6px", fontFamily: "var(--font-montserrat)", whiteSpace: "pre-wrap" }}>
                    {ticket.message}
                  </div>
                </div>

                {ticket.adminReply && (
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-montserrat)" }}>
                      Admin Response
                    </div>
                    <div style={{ fontSize: "14px", color: "#1A1A1A", lineHeight: "1.6", padding: "12px", background: "#D4AF3710", border: "1px solid #D4AF3730", borderRadius: "6px", fontFamily: "var(--font-montserrat)", whiteSpace: "pre-wrap" }}>
                      {ticket.adminReply}
                    </div>
                  </div>
                )}

                {!ticket.adminReply && ticket.status !== "closed" && (
                  <div style={{ padding: "12px", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: "6px", fontSize: "13px", color: "#92400E", fontFamily: "var(--font-montserrat)" }}>
                    ⏳ Our team is reviewing your inquiry. You'll receive a response soon.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9F9F9", paddingTop: "80px", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
            <Ticket size={32} color="#D4AF37" />
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "40px", fontWeight: 700, color: "#1A1A1A", margin: 0 }}>
              My Support
            </h1>
          </div>
          <p style={{ fontSize: "16px", color: "#6B6B6B", fontFamily: "var(--font-montserrat)" }}>
            {session ? "View and track your support tickets" : "Track your support ticket"}
          </p>
        </div>

        {/* Logged In - Show All Tickets */}
        {session && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, color: "#1A1A1A", margin: 0 }}>
                Your Tickets
              </h2>
              <button
                onClick={() => router.push("/support")}
                style={{ padding: "10px 20px", background: "#D4AF37", color: "#1A1A1A", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                + New Ticket
              </button>
            </div>

            {loading ? (
              <div style={{ padding: "60px", textAlign: "center" }}>
                <Loader2 size={32} color="#D4AF37" className="animate-spin" style={{ margin: "0 auto 16px" }} />
                <p style={{ color: "#6B6B6B", fontFamily: "var(--font-montserrat)" }}>Loading your tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "12px", padding: "60px", textAlign: "center" }}>
                <Ticket size={48} color="#E5E5E5" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px" }}>
                  No support tickets yet
                </h3>
                <p style={{ fontSize: "14px", color: "#6B6B6B", fontFamily: "var(--font-montserrat)", marginBottom: "24px" }}>
                  Need help? Create a support ticket and we'll get back to you soon.
                </p>
                <button
                  onClick={() => router.push("/support")}
                  style={{ padding: "12px 24px", background: "#1A1A1A", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  Create Ticket
                </button>
              </div>
            ) : (
              <div>
                {tickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Not Logged In - Track by Ticket Number */}
        {!session && !loading && (
          <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "12px", padding: "40px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, color: "#1A1A1A", marginBottom: "16px" }}>
              Track Your Ticket
            </h2>
            <p style={{ fontSize: "14px", color: "#6B6B6B", fontFamily: "var(--font-montserrat)", marginBottom: "24px" }}>
              Enter your ticket number to view the status and admin response.
            </p>

            <form onSubmit={handleTrackTicket} style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => {
                    setTrackingNumber(e.target.value);
                    setTrackingError("");
                  }}
                  placeholder="Enter ticket number (e.g., TKT-ABC123-XYZ)"
                  required
                  style={{ flex: 1, padding: "12px 16px", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "15px", fontFamily: "var(--font-montserrat)" }}
                />
                <button
                  type="submit"
                  disabled={trackingLoading}
                  style={{ padding: "12px 24px", background: trackingLoading ? "#E5E5E5" : "#1A1A1A", color: trackingLoading ? "#6B6B6B" : "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: trackingLoading ? "not-allowed" : "pointer", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}
                >
                  {trackingLoading ? "Tracking..." : "Track"}
                </button>
              </div>
            </form>

            {trackingError && (
              <div style={{ padding: "16px", background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: "8px", color: "#DC2626", fontSize: "14px", fontFamily: "var(--font-montserrat)", marginBottom: "24px" }}>
                {trackingError}
              </div>
            )}

            {trackingResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ border: "2px solid #D4AF37", borderRadius: "12px", padding: "24px", background: "#FEFDFB" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#D4AF37", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                    {trackingResult.ticketNumber}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: getStatusColor(trackingResult.status), background: `${getStatusColor(trackingResult.status)}15` }}>
                    {getStatusIcon(trackingResult.status)}
                    {getStatusLabel(trackingResult.status)}
                  </span>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 600, color: "#1A1A1A", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
                    {trackingResult.subject}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6B6B6B", fontFamily: "var(--font-montserrat)" }}>
                    {trackingResult.category} • {new Date(trackingResult.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-montserrat)" }}>
                    Your Message
                  </div>
                  <div style={{ fontSize: "14px", color: "#1A1A1A", lineHeight: "1.6", padding: "12px", background: "#F9F9F9", borderRadius: "6px", fontFamily: "var(--font-montserrat)", whiteSpace: "pre-wrap" }}>
                    {trackingResult.message}
                  </div>
                </div>

                {trackingResult.adminReply ? (
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-montserrat)" }}>
                      Admin Response
                    </div>
                    <div style={{ fontSize: "14px", color: "#1A1A1A", lineHeight: "1.6", padding: "12px", background: "#D4AF3710", border: "1px solid #D4AF3730", borderRadius: "6px", fontFamily: "var(--font-montserrat)", whiteSpace: "pre-wrap" }}>
                      {trackingResult.adminReply}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "12px", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: "6px", fontSize: "13px", color: "#92400E", fontFamily: "var(--font-montserrat)" }}>
                    ⏳ Our team is reviewing your inquiry. You'll receive a response soon.
                  </div>
                )}
              </motion.div>
            )}

            <div style={{ marginTop: "32px", padding: "20px", background: "#F9F9F9", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#6B6B6B", fontFamily: "var(--font-montserrat)", marginBottom: "12px" }}>
                Want to create a new support ticket?
              </p>
              <button
                onClick={() => router.push("/support")}
                style={{ padding: "10px 20px", background: "#D4AF37", color: "#1A1A1A", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Create New Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
