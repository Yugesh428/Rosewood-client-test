"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit, Eye, EyeOff, Plus, X } from "lucide-react";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";
const FH = "var(--font-cinzel), 'Cinzel', serif";

type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: "full-time" | "part-time" | "contract" | "internship";
  salaryRange: string | null;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string | null;
  applicationEmail: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

type Stats = {
  total: number;
  active: number;
  inactive: number;
};

const EMPTY_JOB = {
  title: "",
  department: "",
  location: "",
  employmentType: "full-time" as const,
  salaryRange: "",
  description: "",
  requirements: "",
  responsibilities: "",
  benefits: "",
  applicationEmail: "",
  displayOrder: 0,
};

export default function CareersAdmin() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState(EMPTY_JOB);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await fetch("/api/careers");
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch("/api/careers?action=stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }

  function openCreateModal() {
    setEditingJob(null);
    setFormData(EMPTY_JOB);
    setShowModal(true);
  }

  function openEditModal(job: Job) {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      salaryRange: job.salaryRange || "",
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      benefits: job.benefits || "",
      applicationEmail: job.applicationEmail,
      displayOrder: job.displayOrder,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingJob ? `/api/careers/${editingJob.id}` : "/api/careers";
      const method = editingJob ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchJobs();
        await fetchStats();
        setShowModal(false);
        setFormData(EMPTY_JOB);
      } else {
        alert("Failed to save job posting");
      }
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save job posting");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string) {
    try {
      const res = await fetch(`/api/careers/${id}`, {
        method: "PATCH",
      });

      if (res.ok) {
        await fetchJobs();
        await fetchStats();
      } else {
        alert("Failed to toggle job status");
      }
    } catch (error) {
      console.error("Failed to toggle:", error);
      alert("Failed to toggle job status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this job posting?")) return;

    try {
      const res = await fetch(`/api/careers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchJobs();
        await fetchStats();
      } else {
        alert("Failed to delete job posting");
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete job posting");
    }
  }

  return (
    <div style={{ fontFamily: FM }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", paddingTop: "8px", paddingRight: "40px", paddingLeft: "40px" }}>
        <div>
          <h1 style={{ fontFamily: FH, fontSize: "32px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px" }}>
            Career Opportunities
          </h1>
          <p style={{ color: "#6B6B6B", fontSize: "14px" }}>
            Manage job postings and career opportunities
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-flip-careers btn-flip-careers-add active:scale-95"
          data-front="💼 Add Job Posting"
          data-back="💼 Add Job Posting"
        />
        
        <style>{`
          .btn-flip-careers {
            opacity: 1; outline: 0; line-height: 40px;
            position: relative; text-align: center;
            letter-spacing: 0.04em; display: inline-block;
            text-decoration: none;
            font-family: var(--font-montserrat),'Montserrat',sans-serif;
            font-size: 14px; font-weight: 700;
            cursor: pointer; border: none; background: transparent; padding: 0;
          }
          .btn-flip-careers:hover:after  { opacity: 1; transform: translateY(0) rotateX(0); }
          .btn-flip-careers:hover:before { opacity: 0; transform: translateY(50%) rotateX(90deg); }
          .btn-flip-careers:after {
            top: 0; left: 0; opacity: 0; width: 100%; display: block;
            transition: 0.42s cubic-bezier(0.23,1,0.32,1);
            position: absolute; content: attr(data-back);
            transform: translateY(-50%) rotateX(90deg);
            padding: 0 22px; border-radius: 8px;
          }
          .btn-flip-careers:before {
            top: 0; left: 0; opacity: 1; display: block;
            padding: 0 22px; line-height: 40px;
            transition: 0.42s cubic-bezier(0.23,1,0.32,1);
            position: relative; content: attr(data-front);
            transform: translateY(0) rotateX(0); border-radius: 8px;
          }
          
          .btn-flip-careers-add:before {
            background: linear-gradient(135deg, #D4AF37 0%, #C9A52E 100%);
            color: #1A1A1A; border: 1px solid rgba(212,175,55,0.6);
            box-shadow: 0 2px 8px rgba(212,175,55,0.4), 0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.18);
          }
          .btn-flip-careers-add:after {
            background: linear-gradient(135deg, #1A1A1A 0%, #2a2a2a 100%);
            color: #D4AF37; border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 6px 18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06);
          }
        `}</style>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "#fff", border: "1px solid #E5E5E5", padding: "20px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Positions</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#1A1A1A" }}>{stats.total}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E5E5E5", padding: "20px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#16A34A" }}>{stats.active}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E5E5E5", padding: "20px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", color: "#6B6B6B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Inactive</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#6B6B6B" }}>{stats.inactive}</div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "8px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6B6B6B" }}>Loading...</div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6B6B6B" }}>No job postings yet</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9F9F9", borderBottom: "1px solid #E5E5E5" }}>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Position</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Department</th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Location</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                <th style={{ padding: "16px", textAlign: "right", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: "1px solid #E5E5E5" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A", marginBottom: "2px" }}>
                      {job.title}
                    </div>
                    {job.salaryRange && (
                      <div style={{ fontSize: "12px", color: "#6B6B6B" }}>
                        {job.salaryRange}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "16px", fontSize: "14px", color: "#1A1A1A" }}>
                    {job.department}
                  </td>
                  <td style={{ padding: "16px", fontSize: "14px", color: "#6B6B6B" }}>
                    {job.location}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#D4AF37", background: "#D4AF3715" }}>
                      {job.employmentType.replace("-", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: job.isActive ? "#16A34A" : "#6B6B6B", background: job.isActive ? "#16A34A15" : "#E5E5E5" }}>
                      {job.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      {job.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => handleToggle(job.id)}
                        style={{ 
                          padding: "6px 14px", 
                          border: `1px solid ${job.isActive ? "rgba(107,114,128,0.3)" : "rgba(34,197,94,0.35)"}`, 
                          borderRadius: "6px", 
                          background: job.isActive
                            ? "linear-gradient(135deg, rgba(107,114,128,0.10) 0%, rgba(107,114,128,0.05) 100%)"
                            : "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.06) 100%)",
                          cursor: "pointer", 
                          display: "flex", alignItems: "center", gap: "6px",
                          fontSize: "11px", fontWeight: 600,
                          color: job.isActive ? "#6B7280" : "#16A34A",
                          fontFamily: FM, whiteSpace: "nowrap",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.6)",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.transform = "translateY(-1px)";
                          el.style.boxShadow = "0 4px 10px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.6)";
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.transform = "translateY(0)";
                          el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.6)";
                        }}
                        title={job.isActive ? "Deactivate" : "Activate"}
                      >
                        {job.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                        {job.isActive ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => openEditModal(job)}
                        style={{ 
                          padding: "6px 14px", 
                          border: "1px solid rgba(212,175,55,0.35)", 
                          borderRadius: "6px", 
                          background: "linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.06) 100%)",
                          cursor: "pointer", 
                          display: "flex", alignItems: "center", gap: "6px",
                          fontSize: "11px", fontWeight: 600,
                          color: "#b8952e",
                          fontFamily: FM, whiteSpace: "nowrap",
                          boxShadow: "0 1px 3px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "linear-gradient(135deg, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.12) 100%)";
                          el.style.transform = "translateY(-1px)";
                          el.style.boxShadow = "0 4px 10px rgba(212,175,55,0.2), inset 0 1px 0 rgba(255,255,255,0.6)";
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.06) 100%)";
                          el.style.transform = "translateY(0)";
                          el.style.boxShadow = "0 1px 3px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.6)";
                        }}
                        title="Edit"
                      >
                        <Edit size={13} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        style={{ 
                          padding: "6px 14px", 
                          border: "1px solid rgba(239,68,68,0.3)", 
                          borderRadius: "6px", 
                          background: "linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(239,68,68,0.05) 100%)",
                          cursor: "pointer", 
                          display: "flex", alignItems: "center", gap: "6px",
                          fontSize: "11px", fontWeight: 600, color: "#DC2626",
                          fontFamily: FM, whiteSpace: "nowrap",
                          boxShadow: "0 1px 3px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.10) 100%)";
                          el.style.transform = "translateY(-1px)";
                          el.style.boxShadow = "0 4px 10px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.6)";
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(239,68,68,0.05) 100%)";
                          el.style.transform = "translateY(0)";
                          el.style.boxShadow = "0 1px 3px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.6)";
                        }}
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
          <div style={{ background: "#fff", borderRadius: "12px", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid #E5E5E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: FH, fontSize: "24px", fontWeight: 700, color: "#1A1A1A", margin: 0 }}>
                {editingJob ? "Edit Job Posting" : "Add Job Posting"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: "8px", border: "none", background: "transparent", cursor: "pointer", fontSize: "24px", color: "#6B6B6B" }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Department *
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Employment Type *
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px" }}
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    placeholder="£30k - £50k"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Job Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px", resize: "vertical" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Requirements * (one per line)
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  required
                  rows={4}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px", resize: "vertical" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Responsibilities * (one per line)
                </label>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  required
                  rows={4}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px", resize: "vertical" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Benefits (one per line)
                </label>
                <textarea
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  rows={3}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 150px", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Application Email *
                  </label>
                  <input
                    type="email"
                    value={formData.applicationEmail}
                    onChange={(e) => setFormData({ ...formData, applicationEmail: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "6px", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 22px",
                    background: "linear-gradient(135deg, #F5F5F5 0%, #EBEBEB 100%)",
                    color: "#444", border: "1px solid #D5D5D5", borderRadius: "6px",
                    fontSize: "14px", fontWeight: 600, cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 4px 10px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)"; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "10px 22px",
                    background: saving ? "#9CA3AF" : "linear-gradient(135deg, #D4AF37 0%, #C9A52E 100%)",
                    color: "#1A1A1A", border: saving ? "1px solid #9CA3AF" : "1px solid rgba(212,175,55,0.6)",
                    borderRadius: "6px", fontSize: "14px", fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: saving ? "none" : "0 2px 8px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { if (!saving) { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-1px)"; el.style.boxShadow = "0 6px 16px rgba(212,175,55,0.4), inset 0 1px 0 rgba(255,255,255,0.18)"; }}}
                  onMouseLeave={e => { if (!saving) { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 2px 8px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.18)"; }}}
                >
                  {saving ? "Saving..." : editingJob ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
