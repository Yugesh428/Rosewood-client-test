"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit, Eye, EyeOff, Plus, X } from "lucide-react";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";
const FH = "var(--font-cinzel), 'Cinzel', serif";

type Section = {
  id: string;
  title: string;
  content: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const EMPTY_SECTION = {
  title: "",
  content: "",
  displayOrder: 0,
};

export default function TermsAdmin() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState(EMPTY_SECTION);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  async function fetchSections() {
    setLoading(true);
    try {
      const res = await fetch("/api/terms");
      if (res.ok) {
        const data = await res.json();
        setSections(data);
      }
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingSection(null);
    setFormData(EMPTY_SECTION);
    setShowModal(true);
  }

  function openEditModal(section: Section) {
    setEditingSection(section);
    setFormData({
      title: section.title,
      content: section.content,
      displayOrder: section.displayOrder,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingSection ? `/api/terms/${editingSection.id}` : "/api/terms";
      const method = editingSection ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchSections();
        setShowModal(false);
        setFormData(EMPTY_SECTION);
      } else {
        alert("Failed to save section");
      }
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save section");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string) {
    try {
      const res = await fetch(`/api/terms/${id}`, {
        method: "PATCH",
      });

      if (res.ok) {
        await fetchSections();
      } else {
        alert("Failed to toggle section status");
      }
    } catch (error) {
      console.error("Failed to toggle:", error);
      alert("Failed to toggle section status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      const res = await fetch(`/api/terms/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchSections();
      } else {
        alert("Failed to delete section");
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete section");
    }
  }

  return (
    <div style={{ fontFamily: FM }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", paddingTop: "8px", paddingRight: "40px", paddingLeft: "40px" }}>
        <div>
          <h1 style={{ fontFamily: FH, fontSize: "32px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px" }}>
            Terms & Conditions
          </h1>
          <p style={{ color: "#6B6B6B", fontSize: "14px" }}>
            Manage terms and conditions sections
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-flip-terms btn-flip-terms-add active:scale-95"
          data-front="📄 Add Section"
          data-back="📄 Add Section"
        />
        
        <style>{`
          .btn-flip-terms {
            opacity: 1; outline: 0; line-height: 40px;
            position: relative; text-align: center;
            letter-spacing: 0.04em; display: inline-block;
            text-decoration: none;
            font-family: var(--font-montserrat),'Montserrat',sans-serif;
            font-size: 14px; font-weight: 700;
            cursor: pointer; border: none; background: transparent; padding: 0;
          }
          .btn-flip-terms:hover:after  { opacity: 1; transform: translateY(0) rotateX(0); }
          .btn-flip-terms:hover:before { opacity: 0; transform: translateY(50%) rotateX(90deg); }
          .btn-flip-terms:after {
            top: 0; left: 0; opacity: 0; width: 100%; display: block;
            transition: 0.42s cubic-bezier(0.23,1,0.32,1);
            position: absolute; content: attr(data-back);
            transform: translateY(-50%) rotateX(90deg);
            padding: 0 22px; border-radius: 8px;
          }
          .btn-flip-terms:before {
            top: 0; left: 0; opacity: 1; display: block;
            padding: 0 22px; line-height: 40px;
            transition: 0.42s cubic-bezier(0.23,1,0.32,1);
            position: relative; content: attr(data-front);
            transform: translateY(0) rotateX(0); border-radius: 8px;
          }
          
          .btn-flip-terms-add:before {
            background: linear-gradient(135deg, #D4AF37 0%, #C9A52E 100%);
            color: #1A1A1A; border: 1px solid rgba(212,175,55,0.6);
            box-shadow: 0 2px 8px rgba(212,175,55,0.4), 0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.18);
          }
          .btn-flip-terms-add:after {
            background: linear-gradient(135deg, #1A1A1A 0%, #2a2a2a 100%);
            color: #D4AF37; border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 6px 18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06);
          }
        `}</style>
      </div>

      {/* Sections List */}
      <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6B6B6B" }}>Loading...</div>
        ) : sections.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6B6B6B" }}>No sections yet</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9F9F9", borderBottom: "1px solid #E5E5E5" }}>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em", width: "60px" }}>Order</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Title</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Content Preview</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                <th style={{ padding: "16px", textAlign: "right", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.id} style={{ borderBottom: "1px solid #E5E5E5" }}>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", background: "#D4AF3715", border: "1px solid #D4AF3730", borderRadius: "50%", fontSize: "14px", fontWeight: 700, color: "#D4AF37" }}>
                      {section.displayOrder}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A" }}>
                      {section.title}
                    </div>
                  </td>
                  <td style={{ padding: "16px", fontSize: "14px", color: "#6B6B6B", maxWidth: "400px" }}>
                    {section.content.substring(0, 100)}...
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: section.isActive ? "#16A34A" : "#6B6B6B", background: section.isActive ? "#16A34A15" : "#E5E5E5" }}>
                      {section.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      {section.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => handleToggle(section.id)}
                        style={{ 
                          padding: "6px 14px", border: `1px solid ${section.isActive ? "rgba(107,114,128,0.3)" : "rgba(34,197,94,0.35)"}`,
                          borderRadius: "6px",
                          background: section.isActive ? "linear-gradient(135deg, rgba(107,114,128,0.10) 0%, rgba(107,114,128,0.05) 100%)" : "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.06) 100%)",
                          cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                          fontSize: "11px", fontWeight: 600, color: section.isActive ? "#6B7280" : "#16A34A",
                          fontFamily: FM, whiteSpace: "nowrap",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.6)",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 4px 10px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.6)"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.6)"; }}
                        title={section.isActive ? "Deactivate" : "Activate"}
                      >
                        {section.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                        {section.isActive ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => openEditModal(section)}
                        style={{ 
                          padding: "6px 14px", border: "1px solid rgba(212,175,55,0.35)",
                          borderRadius: "6px",
                          background: "linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.06) 100%)",
                          cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                          fontSize: "11px", fontWeight: 600, color: "#b8952e",
                          fontFamily: FM, whiteSpace: "nowrap",
                          boxShadow: "0 1px 3px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "linear-gradient(135deg, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.12) 100%)"; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 4px 10px rgba(212,175,55,0.2), inset 0 1px 0 rgba(255,255,255,0.6)"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.06) 100%)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 1px 3px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.6)"; }}
                        title="Edit"
                      >
                        <Edit size={13} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
                        style={{ 
                          padding: "6px 14px", border: "1px solid rgba(239,68,68,0.3)",
                          borderRadius: "6px",
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
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "12px", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid #E5E5E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: FH, fontSize: "24px", fontWeight: 700, color: "#1A1A1A", margin: 0 }}>
                {editingSection ? "Edit Section" : "Add Section"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: "8px", border: "none", background: "transparent", cursor: "pointer", fontSize: "24px", color: "#6B6B6B" }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Section Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Introduction, Refund Policy, etc."
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={12}
                  placeholder="Enter the section content..."
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px", resize: "vertical", lineHeight: "1.6" }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  min="0"
                  style={{ width: "150px", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px" }}
                />
                <p style={{ fontSize: "12px", color: "#6B6B6B", marginTop: "8px" }}>Lower numbers appear first</p>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "10px 22px", background: "linear-gradient(135deg, #F5F5F5 0%, #EBEBEB 100%)", color: "#444", border: "1px solid #D5D5D5", borderRadius: "6px", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)", transition: "all 0.15s ease" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 4px 10px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)"; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: "10px 22px", background: saving ? "#9CA3AF" : "linear-gradient(135deg, #D4AF37 0%, #C9A52E 100%)", color: "#1A1A1A", border: saving ? "1px solid #9CA3AF" : "1px solid rgba(212,175,55,0.6)", borderRadius: "6px", fontSize: "14px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 2px 8px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.18)", transition: "all 0.15s ease" }}
                  onMouseEnter={e => { if (!saving) { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 6px 16px rgba(212,175,55,0.4), inset 0 1px 0 rgba(255,255,255,0.18)"; }}}
                  onMouseLeave={e => { if (!saving) { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 2px 8px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.18)"; }}}
                >
                  {saving ? "Saving..." : editingSection ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
