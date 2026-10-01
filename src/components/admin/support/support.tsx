"use client";

import { useState, useEffect } from "react";
import { Trash2, Eye, AlertCircle, CheckCircle, Clock, XCircle, Send } from "lucide-react";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";
const FH = "var(--font-cinzel), 'Cinzel', serif";

type Ticket = {
  id: string;
  ticketNumber: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  subject: string;
  category: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  message: string;
  assignedTo: string | null;
  adminReply: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Stats = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
};

export default function SupportTicketsAdmin() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminReply, setAdminReply] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [statusFilter, searchTerm]);

  async function fetchTickets() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);

      const res = await fetch(`/api/support?${params}`);
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

  async function fetchStats() {
    try {
      const res = await fetch("/api/support?action=stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const res = await fetch(`/api/support/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTickets((prev) => prev.filter((t) => t.id !== id));
        fetchStats();
      } else {
        alert("Failed to delete ticket");
      }
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      alert("Failed to delete ticket");
    }
  }

  async function handleUpdateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/support/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchTickets();
        fetchStats();
        if (selectedTicket?.id === id) {
          const updated = await res.json();
          setSelectedTicket(updated);
        }
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  }

  async function handleSaveReply() {
    if (!selectedTicket || !adminReply.trim()) return;

    setSavingReply(true);
    try {
      const res = await fetch(`/api/support/${selectedTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: adminReply.trim() }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedTicket(updated);
        setAdminReply("");
        fetchTickets();
        alert("Reply saved successfully!");
      } else {
        alert("Failed to save reply");
      }
    } catch (error) {
      console.error("Failed to save reply:", error);
      alert("Failed to save reply");
    } finally {
      setSavingReply(false);
    }
  }

  function openTicketModal(ticket: Ticket) {
    setSelectedTicket(ticket);
    setAdminReply(ticket.adminReply || "");
    setShowModal(true);
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "open": return <AlertCircle size={14} />;
      case "in_progress": return <Clock size={14} />;
      case "resolved": return <CheckCircle size={14} />;
      case "closed": return <XCircle size={14} />;
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

  return (
    <div style={{ fontFamily: FM }}>
      {/* Header */}
      <div style={{ marginBottom: "32px", paddingTop: "8px", paddingLeft: "40px", paddingRight: "40px" }}>
        <h1 style={{ fontFamily: FH, fontSize: "32px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px" }}>
          Customer Support
        </h1>
        <p style={{ color: "#6B6B6B", fontSize: "14px" }}>
          Manage customer support tickets and inquiries
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "#fff", border: "1px solid #E5E5E5", padding: "20px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Tickets</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#1A1A1A" }}>{stats.total}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E5E5E5", padding: "20px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Open</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#2563EB" }}>{stats.open}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E5E5E5", padding: "20px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>In Progress</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#CA8A04" }}>{stats.inProgress}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E5E5E5", padding: "20px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Resolved</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#16A34A" }}>{stats.resolved}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ background: "#fff", border: "1px solid #E5E5E5", padding: "20px", borderRadius: "8px", marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "16px", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#1A1A1A", marginBottom: "8px" }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#1A1A1A", marginBottom: "8px" }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px" }}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6B6B6B" }}>Loading...</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6B6B6B" }}>No tickets found</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9F9F9", borderBottom: "1px solid #E5E5E5" }}>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ticket #</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</th>
                <th style={{ padding: "16px", textAlign: "right", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} style={{ borderBottom: "1px solid #E5E5E5" }}>
                  <td style={{ padding: "16px", fontSize: "13px", fontWeight: 600, color: "#D4AF37" }}>
                    {ticket.ticketNumber}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A", marginBottom: "2px" }}>
                      {ticket.customerName}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6B6B6B" }}>
                      {ticket.customerEmail}
                    </div>
                  </td>
                  <td style={{ padding: "16px", fontSize: "14px", color: "#1A1A1A", maxWidth: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {ticket.subject}
                  </td>
                  <td style={{ padding: "16px", fontSize: "13px", color: "#6B6B6B" }}>
                    {ticket.category}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: getStatusColor(ticket.status), background: `${getStatusColor(ticket.status)}15` }}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", fontSize: "13px", color: "#6B6B6B" }}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => openTicketModal(ticket)}
                        style={{ 
                          padding: "6px 14px", border: "1px solid rgba(212,175,55,0.35)", borderRadius: "6px",
                          background: "linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.06) 100%)",
                          cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                          fontSize: "11px", fontWeight: 600, color: "#b8952e",
                          fontFamily: FM, whiteSpace: "nowrap",
                          boxShadow: "0 1px 3px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "linear-gradient(135deg, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.12) 100%)"; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 4px 10px rgba(212,175,55,0.2), inset 0 1px 0 rgba(255,255,255,0.6)"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.06) 100%)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 1px 3px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.6)"; }}
                        title="View Details"
                      >
                        <Eye size={13} color="#b8952e" />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        style={{ 
                          padding: "6px 14px", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px",
                          background: "linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(239,68,68,0.05) 100%)",
                          cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                          fontSize: "11px", fontWeight: 600, color: "#DC2626",
                          fontFamily: FM, whiteSpace: "nowrap",
                          boxShadow: "0 1px 3px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.10) 100%)"; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 4px 10px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.6)"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(239,68,68,0.05) 100%)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 1px 3px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.6)"; }}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedTicket && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "12px", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid #E5E5E5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontFamily: FH, fontSize: "24px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px" }}>
                    Ticket Details
                  </h2>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#D4AF37" }}>
                    {selectedTicket.ticketNumber}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ padding: "8px", border: "none", background: "transparent", cursor: "pointer", fontSize: "24px", color: "#6B6B6B" }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Customer Info */}
              <div style={{ marginBottom: "24px", padding: "16px", background: "#F9F9F9", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#6B6B6B", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#6B6B6B", marginBottom: "4px" }}>Name</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A" }}>{selectedTicket.customerName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#6B6B6B", marginBottom: "4px" }}>Email</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A" }}>{selectedTicket.customerEmail}</div>
                  </div>
                  {selectedTicket.customerPhone && (
                    <div>
                      <div style={{ fontSize: "11px", color: "#6B6B6B", marginBottom: "4px" }}>Phone</div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A" }}>{selectedTicket.customerPhone}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject & Category */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject</div>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#1A1A1A", marginBottom: "12px" }}>{selectedTicket.subject}</div>
                <div style={{ fontSize: "13px", color: "#6B6B6B" }}>Category: {selectedTicket.category}</div>
              </div>

              {/* Customer Message */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer Message</div>
                <div style={{ fontSize: "14px", color: "#1A1A1A", lineHeight: "1.6", padding: "16px", background: "#F9F9F9", borderRadius: "8px", whiteSpace: "pre-wrap" }}>
                  {selectedTicket.message}
                </div>
              </div>

              {/* Admin Reply */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Admin Reply</div>
                <textarea
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Write your reply to the customer..."
                  rows={6}
                  style={{ width: "100%", padding: "12px", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "14px", lineHeight: "1.6", resize: "vertical", fontFamily: FM }}
                />
                <button
                  onClick={handleSaveReply}
                  disabled={savingReply || !adminReply.trim()}
                  style={{
                    marginTop: "12px", padding: "10px 22px",
                    background: (savingReply || !adminReply.trim()) ? "linear-gradient(135deg, #E5E5E5 0%, #D5D5D5 100%)" : "linear-gradient(135deg, #D4AF37 0%, #C9A52E 100%)",
                    color: (savingReply || !adminReply.trim()) ? "#9CA3AF" : "#1A1A1A",
                    border: (savingReply || !adminReply.trim()) ? "1px solid #D5D5D5" : "1px solid rgba(212,175,55,0.6)",
                    borderRadius: "6px", fontSize: "13px", fontWeight: 600,
                    cursor: (savingReply || !adminReply.trim()) ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: "8px",
                    boxShadow: (savingReply || !adminReply.trim()) ? "none" : "0 2px 8px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { if (!savingReply && adminReply.trim()) { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 6px 16px rgba(212,175,55,0.4), inset 0 1px 0 rgba(255,255,255,0.18)"; }}}
                  onMouseLeave={e => { if (!savingReply && adminReply.trim()) { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 2px 8px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.18)"; }}}
                >
                  <Send size={14} />
                  {savingReply ? "Saving..." : "Save Reply"}
                </button>
              </div>

              {/* Status Control */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Ticket Status
                </label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px" }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Timestamps */}
              <div style={{ fontSize: "12px", color: "#6B6B6B", padding: "16px", background: "#F9F9F9", borderRadius: "8px" }}>
                <div style={{ marginBottom: "8px" }}>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</div>
                {selectedTicket.resolvedAt && (
                  <div style={{ marginBottom: "8px" }}>Resolved: {new Date(selectedTicket.resolvedAt).toLocaleString()}</div>
                )}
                {selectedTicket.closedAt && (
                  <div>Closed: {new Date(selectedTicket.closedAt).toLocaleString()}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
