"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { MessageCircle, Send, Loader2 } from "lucide-react";

const categories = [
  "General Inquiry",
  "Order Issue",
  "Product Question",
  "Prescription Services",
  "Delivery Question",
  "Refund Request",
  "Technical Support",
  "Complaint",
  "Other",
];

export default function SupportPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    customerName: session?.user?.name || "",
    customerEmail: session?.user?.email || "",
    customerPhone: "",
    subject: "",
    category: "General Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: session?.user?.id,
          ...formData,
        }),
      });

      if (res.ok) {
        const ticket = await res.json();
        setTicketNumber(ticket.ticketNumber);
        setSubmitted(true);
        setFormData({
          customerName: session?.user?.name || "",
          customerEmail: session?.user?.email || "",
          customerPhone: "",
          subject: "",
          category: "General Inquiry",
          message: "",
        });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit ticket");
      }
    } catch (err) {
      setError("Failed to submit ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9F9F9", paddingTop: "80px", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
            <MessageCircle size={32} color="#D4AF37" />
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "40px", fontWeight: 700, color: "#1A1A1A", margin: 0 }}>
              Customer Support
            </h1>
          </div>
          <p style={{ fontSize: "16px", color: "#6B6B6B", fontFamily: "var(--font-montserrat)", lineHeight: "1.6", maxWidth: "600px", margin: "0 auto" }}>
            Need help? Submit a support ticket and our team will get back to you as soon as possible.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ background: "#fff", padding: "48px", borderRadius: "12px", border: "1px solid #E5E5E5", textAlign: "center" }}
            >
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#16A34A15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, color: "#1A1A1A", marginBottom: "12px" }}>
                Ticket Submitted Successfully!
              </h2>
              <p style={{ fontSize: "15px", color: "#6B6B6B", marginBottom: "24px", lineHeight: "1.6" }}>
                Your support ticket has been created. Our team will review your inquiry and respond within 24-48 hours.
              </p>
              <div style={{ display: "inline-block", padding: "16px 24px", background: "#D4AF37", borderRadius: "8px", marginBottom: "32px" }}>
                <div style={{ fontSize: "12px", color: "#1A1A1A", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Your Ticket Number
                </div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#1A1A1A", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                  {ticketNumber}
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "#6B6B6B", marginBottom: "24px" }}>
                Save this ticket number to track your inquiry
              </p>
              <button
                onClick={() => setSubmitted(false)}
                style={{ padding: "12px 32px", background: "#1A1A1A", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Submit Another Ticket
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              style={{ background: "#fff", padding: "40px", borderRadius: "12px", border: "1px solid #E5E5E5" }}
            >
              {error && (
                <div style={{ padding: "16px", background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: "8px", marginBottom: "24px", color: "#DC2626", fontSize: "14px" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", padding: "12px 16px", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "15px", fontFamily: "var(--font-montserrat)" }}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", padding: "12px 16px", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "15px", fontFamily: "var(--font-montserrat)" }}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "12px 16px", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "15px", fontFamily: "var(--font-montserrat)" }}
                    placeholder="+44 7700 900000"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", padding: "12px 16px", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "15px", fontFamily: "var(--font-montserrat)" }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "12px 16px", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "15px", fontFamily: "var(--font-montserrat)" }}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div style={{ marginBottom: "32px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={8}
                  style={{ width: "100%", padding: "12px 16px", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "15px", fontFamily: "var(--font-montserrat)", lineHeight: "1.6", resize: "vertical" }}
                  placeholder="Please provide detailed information about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", padding: "16px", background: loading ? "#6B6B6B" : "#1A1A1A", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", transition: "background 0.2s" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Support Ticket
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Info Section */}
        {!submitted && (
          <div style={{ marginTop: "48px", padding: "32px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: "12px" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 700, color: "#1A1A1A", marginBottom: "16px" }}>
              What happens next?
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "You'll receive a ticket number immediately after submission",
                "Our support team will review your inquiry within 24-48 hours",
                "We'll contact you via email with updates and solutions",
                "You can track your ticket status using the ticket number",
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", gap: "12px", marginBottom: "12px", fontSize: "14px", color: "#6B6B6B", fontFamily: "var(--font-montserrat)", lineHeight: "1.6" }}>
                  <span style={{ color: "#D4AF37", fontWeight: "bold" }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
