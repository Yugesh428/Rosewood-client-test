"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, MapPin, Clock, DollarSign, ChevronDown, ChevronUp, Mail, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";

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
  createdAt: string;
};

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await fetch("/api/careers?activeOnly=true");
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

  const departments = ["all", ...Array.from(new Set(jobs.map((j) => j.department)))];
  const filteredJobs = selectedDepartment === "all" 
    ? jobs 
    : jobs.filter((j) => j.department === selectedDepartment);

  function getEmploymentTypeLabel(type: string) {
    return type.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  function formatList(text: string) {
    return text.split("\n").filter(line => line.trim());
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9F9F9" }}>
      <Navbar />
      
      {/* Hero Section */}
      <div style={{ padding: "80px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden", marginTop: "60px" }}>
        {/* Background Image */}
        <div 
          style={{ 
            position: "absolute", 
            inset: 0, 
            backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80')", 
            backgroundSize: "cover", 
            backgroundPosition: "center",
            zIndex: 0
          }} 
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(26,26,26,0.4) 0%, rgba(45,45,45,0.35) 100%)", zIndex: 0 }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #D4AF37, transparent)", zIndex: 1 }} />
        
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", padding: "8px 20px", background: "rgba(212,175,55,0.25)", border: "1px solid rgba(212,175,55,0.6)", borderRadius: "30px", marginBottom: "24px", backdropFilter: "blur(8px)" }}>
            <Briefcase size={18} color="#D4AF37" />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#D4AF37", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Join Our Team
            </span>
          </div>

          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "48px", fontWeight: 700, color: "#fff", marginBottom: "20px", lineHeight: "1.2", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
            Build Your Career at<br />Rosewood Pharmacy
          </h1>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.95)", fontFamily: "var(--font-montserrat)", lineHeight: "1.6", maxWidth: "600px", margin: "0 auto", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
            Join a team dedicated to providing exceptional healthcare and wellness solutions. Explore opportunities to grow with us.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "-40px auto 0", padding: "0 24px 80px", position: "relative", zIndex: 2 }}>
        
        {/* Filters */}
        <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "12px", padding: "24px", marginBottom: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#6B6B6B", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-montserrat)" }}>
            Filter by Department
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                style={{ padding: "10px 20px", background: selectedDepartment === dept ? "#D4AF37" : "#F9F9F9", color: selectedDepartment === dept ? "#1A1A1A" : "#6B6B6B", border: selectedDepartment === dept ? "1px solid #D4AF37" : "1px solid #E5E5E5", borderRadius: "30px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-montserrat)", textTransform: "capitalize", transition: "all 0.2s" }}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div style={{ width: "40px", height: "40px", border: "3px solid #E5E5E5", borderTop: "3px solid #D4AF37", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "#6B6B6B", fontFamily: "var(--font-montserrat)" }}>Loading opportunities...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "12px", padding: "60px", textAlign: "center" }}>
            <Briefcase size={48} color="#E5E5E5" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px" }}>
              No openings at the moment
            </h3>
            <p style={{ fontSize: "14px", color: "#6B6B6B", fontFamily: "var(--font-montserrat)" }}>
              Check back soon for new opportunities or send your CV to careers@rosewoodpharmacy.co.uk
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {filteredJobs.map((job) => {
              const isExpanded = expandedJob === job.id;

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "12px", overflow: "hidden", transition: "all 0.3s" }}
                >
                  <button
                    onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                    style={{ width: "100%", padding: "24px", display: "flex", alignItems: "start", justifyContent: "space-between", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                        <span style={{ padding: "4px 12px", background: "#D4AF3715", border: "1px solid #D4AF3730", borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {job.department}
                        </span>
                        <span style={{ padding: "4px 12px", background: "#F9F9F9", border: "1px solid #E5E5E5", borderRadius: "20px", fontSize: "11px", fontWeight: 600, color: "#6B6B6B", textTransform: "uppercase" }}>
                          {getEmploymentTypeLabel(job.employmentType)}
                        </span>
                      </div>

                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "#1A1A1A", marginBottom: "12px" }}>
                        {job.title}
                      </h3>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "14px", color: "#6B6B6B", fontFamily: "var(--font-montserrat)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <MapPin size={14} />
                          {job.location}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Clock size={14} />
                          {getEmploymentTypeLabel(job.employmentType)}
                        </div>
                        {job.salaryRange && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <DollarSign size={14} />
                            {job.salaryRange}
                          </div>
                        )}
                      </div>
                    </div>

                    {isExpanded ? <ChevronUp size={24} color="#6B6B6B" /> : <ChevronDown size={24} color="#6B6B6B" />}
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
                        <div style={{ padding: "24px" }}>
                          {/* Description */}
                          <div style={{ marginBottom: "24px" }}>
                            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-montserrat)" }}>
                              About the Role
                            </h4>
                            <p style={{ fontSize: "15px", color: "#1A1A1A", lineHeight: "1.6", fontFamily: "var(--font-montserrat)" }}>
                              {job.description}
                            </p>
                          </div>

                          {/* Requirements */}
                          <div style={{ marginBottom: "24px" }}>
                            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-montserrat)" }}>
                              Requirements
                            </h4>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                              {formatList(job.requirements).map((req, i) => (
                                <li key={i} style={{ display: "flex", gap: "12px", marginBottom: "8px", fontSize: "14px", color: "#1A1A1A", fontFamily: "var(--font-montserrat)", lineHeight: "1.6" }}>
                                  <span style={{ color: "#D4AF37", fontWeight: "bold", flexShrink: 0 }}>✓</span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Responsibilities */}
                          <div style={{ marginBottom: "24px" }}>
                            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-montserrat)" }}>
                              Responsibilities
                            </h4>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                              {formatList(job.responsibilities).map((resp, i) => (
                                <li key={i} style={{ display: "flex", gap: "12px", marginBottom: "8px", fontSize: "14px", color: "#1A1A1A", fontFamily: "var(--font-montserrat)", lineHeight: "1.6" }}>
                                  <span style={{ color: "#D4AF37", fontWeight: "bold", flexShrink: 0 }}>•</span>
                                  <span>{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Benefits */}
                          {job.benefits && (
                            <div style={{ marginBottom: "24px" }}>
                              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-montserrat)" }}>
                                Benefits
                              </h4>
                              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                {formatList(job.benefits).map((benefit, i) => (
                                  <li key={i} style={{ display: "flex", gap: "12px", marginBottom: "8px", fontSize: "14px", color: "#1A1A1A", fontFamily: "var(--font-montserrat)", lineHeight: "1.6" }}>
                                    <span style={{ color: "#D4AF37", fontWeight: "bold", flexShrink: 0 }}>★</span>
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Apply Button */}
                          <div style={{ padding: "20px", background: "#F9F9F9", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 700, color: "#6B6B6B", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-montserrat)" }}>
                                Ready to Apply?
                              </div>
                              <div style={{ fontSize: "14px", color: "#1A1A1A", fontFamily: "var(--font-montserrat)" }}>
                                Send your CV and cover letter to:
                              </div>
                            </div>
                            <a
                              href={`mailto:${job.applicationEmail}?subject=Application for ${job.title}`}
                              style={{ padding: "12px 24px", background: "#D4AF37", color: "#1A1A1A", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-montserrat)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", transition: "all 0.2s" }}
                            >
                              <Mail size={16} />
                              Apply Now
                              <ArrowRight size={16} />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <Footer />
    </div>
  );
}
