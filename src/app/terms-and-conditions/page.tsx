"use client";

import { useState, useEffect } from "react";
import { Scale, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";

type TermsSection = {
  id: string;
  title: string;
  content: string;
  displayOrder: number;
  updatedAt: string;
};

export default function TermsAndConditionsPage() {
  const [sections, setSections] = useState<TermsSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  async function fetchSections() {
    setLoading(true);
    try {
      const res = await fetch("/api/terms?activeOnly=true");
      if (res.ok) {
        const data = await res.json();
        setSections(data);
      }
    } catch (error) {
      console.error("Failed to fetch terms:", error);
    } finally {
      setLoading(false);
    }
  }

  const lastUpdated = sections.length > 0 
    ? new Date(Math.max(...sections.map(s => new Date(s.updatedAt).getTime())))
    : new Date();

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "100vh", background: "#F9F9F9", paddingTop: "140px", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
            <Scale size={32} color="#D4AF37" />
          </div>
          <h1 style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif", fontSize: "40px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 16px 0" }}>
            Terms & Conditions
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", color: "#6B6B6B", fontFamily: "var(--font-sans), 'Inter', sans-serif" }}>
            <Calendar size={16} />
            <span>Last updated: {lastUpdated.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div style={{ width: "40px", height: "40px", border: "3px solid #E5E5E5", borderTop: "3px solid #D4AF37", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "#6B6B6B", fontFamily: "var(--font-montserrat)" }}>Loading...</p>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "12px", padding: "40px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            {sections.map((section, index) => (
              <div 
                key={section.id} 
                style={{ 
                  marginBottom: index < sections.length - 1 ? "32px" : "0",
                  paddingBottom: index < sections.length - 1 ? "32px" : "0",
                  borderBottom: index < sections.length - 1 ? "1px solid #E5E5E5" : "none"
                }}
              >
                <h2 style={{ 
                  fontFamily: "var(--font-cinzel), 'Cinzel', serif", 
                  fontSize: "24px", 
                  fontWeight: 700, 
                  color: "#1A1A1A", 
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <span style={{ 
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    background: "#D4AF3715",
                    border: "1px solid #D4AF3730",
                    borderRadius: "50%",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#D4AF37",
                    fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
                  }}>
                    {section.displayOrder}
                  </span>
                  {section.title}
                </h2>
                <p style={{ 
                  fontSize: "15px", 
                  color: "#374151", 
                  lineHeight: "1.8", 
                  fontFamily: "var(--font-sans), 'Inter', sans-serif",
                  whiteSpace: "pre-wrap"
                }}>
                  {section.content}
                </p>
              </div>
            ))}

            {/* Footer Notice */}
            <div style={{ 
              marginTop: "48px", 
              padding: "20px", 
              background: "#F9F9F9", 
              borderRadius: "8px",
              border: "1px solid #E5E5E5"
            }}>
              <p style={{ 
                fontSize: "13px", 
                color: "#6B6B6B", 
                lineHeight: "1.6", 
                fontFamily: "var(--font-sans), 'Inter', sans-serif",
                margin: 0
              }}>
                <strong style={{ color: "#1A1A1A" }}>Note:</strong> These terms and conditions are in addition to our standard terms of sale. By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these terms. If you have any questions or concerns about these terms, please contact our customer service team.
              </p>
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div style={{ marginTop: "32px", padding: "24px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: "12px", textAlign: "center" }}>
          <h3 style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif", fontSize: "18px", fontWeight: 700, color: "#1A1A1A", marginBottom: "12px" }}>
            Questions About Our Terms?
          </h3>
          <p style={{ fontSize: "14px", color: "#6B6B6B", fontFamily: "var(--font-sans), 'Inter', sans-serif", marginBottom: "16px" }}>
            If you have any questions regarding our Terms & Conditions, please don't hesitate to contact us.
          </p>
          <a
            href="mailto:legal@rosewoodpharmacy.co.uk"
            style={{ 
              display: "inline-block",
              padding: "12px 24px", 
              background: "#D4AF37", 
              color: "#1A1A1A", 
              border: "none", 
              borderRadius: "6px", 
              fontSize: "14px", 
              fontWeight: 700, 
              cursor: "pointer", 
              fontFamily: "var(--font-montserrat)", 
              textTransform: "uppercase", 
              letterSpacing: "0.05em",
              textDecoration: "none",
              transition: "all 0.2s"
            }}
          >
            Contact Legal Team
          </a>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      </div>
      <Footer />
    </>
  );
}
