"use client";

import { useState } from "react";
import {
  Home,
  Info,
  Phone,
  ChevronDown,
  ChevronUp,
  Save,
  Eye,
  Image,
  Type,
  AlignLeft,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroSection {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
}

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface HomeContent {
  hero: HeroSection;
  features: FeatureItem[];
  aboutSnippet: string;
  announcementBar: string;
  announcementEnabled: boolean;
}

interface AboutContent {
  pageTitle: string;
  pageSubtitle: string;
  storyTitle: string;
  storyText: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  teamTitle: string;
  teamSubtitle: string;
  founderName: string;
  founderRole: string;
  founderBio: string;
}

interface ContactContent {
  pageTitle: string;
  pageSubtitle: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapEmbedUrl: string;
  formTitle: string;
  formSubtitle: string;
}

// ─── Default data ─────────────────────────────────────────────────────────────

const defaultHome: HomeContent = {
  hero: {
    headline: "Your Trusted Pharmacy",
    subheadline: "Premium medicines and healthcare products delivered to your doorstep.",
    ctaText: "Shop Now",
    ctaLink: "/products",
    backgroundImage: "",
  },
  features: [
    { icon: "🛡️", title: "Trusted Quality", description: "All products are verified and certified." },
    { icon: "🚀", title: "Fast Delivery", description: "Same-day delivery available in your area." },
    { icon: "💊", title: "Expert Advice", description: "Consult our pharmacists anytime." },
  ],
  aboutSnippet: "Rosewood Pharmacy has been serving the community since 2010 with care and excellence.",
  announcementBar: "🎉 Free delivery on orders above $50! Use code: ROSEWOOD",
  announcementEnabled: true,
};

const defaultAbout: AboutContent = {
  pageTitle: "About Rosewood Pharmacy",
  pageSubtitle: "A legacy of care, trust, and excellence in healthcare.",
  storyTitle: "Our Story",
  storyText:
    "Founded in 2010, Rosewood Pharmacy began as a small community drugstore with a vision to make quality healthcare accessible to everyone. Over the years, we have grown into a full-service pharmacy trusted by thousands of families.",
  missionTitle: "Our Mission",
  missionText:
    "To provide every customer with the highest quality pharmaceutical care, delivered with compassion, integrity, and professionalism.",
  visionTitle: "Our Vision",
  visionText:
    "To be the most trusted pharmacy brand in the region — known for our people, our products, and our commitment to health.",
  teamTitle: "Meet Our Team",
  teamSubtitle: "Dedicated professionals committed to your health.",
  founderName: "Dr. Sarah Rosewood",
  founderRole: "Founder & Chief Pharmacist",
  founderBio:
    "With over 20 years of experience in pharmaceutical care, Dr. Sarah established Rosewood Pharmacy with a commitment to personalised service.",
};

const defaultContact: ContactContent = {
  pageTitle: "Contact Us",
  pageSubtitle: "We are here to help. Reach out to us anytime.",
  address: "123 Rosewood Avenue, Health District, City - 400001",
  phone: "+1 (555) 123-4567",
  email: "hello@rosewoodpharmacy.com",
  hours: "Mon–Sat: 8:00 AM – 9:00 PM\nSunday: 10:00 AM – 6:00 PM",
  mapEmbedUrl: "",
  formTitle: "Send Us a Message",
  formSubtitle: "Fill out the form below and we'll get back to you within 24 hours.",
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-sm"
            style={{
              background: "linear-gradient(135deg, #1c1c1c, #141414)",
            }}
          >
            <Icon className="w-4 h-4" style={{ color: "#D4AF37" }} />
          </div>
          <span className="font-heading text-base text-gray-900">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-gray-100">{children}</div>
      )}
    </div>
  );
}

// ─── Field components ─────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] uppercase tracking-[0.12em] font-semibold text-gray-600">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors";
const textareaCls =
  "w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors resize-none";

// ─── Save toast ───────────────────────────────────────────────────────────────

function SaveToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-sm shadow-xl border border-[#D4AF37]/30">
      <Save className="w-4 h-4 text-[#D4AF37]" />
      <span className="text-sm font-medium">Changes saved successfully</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SiteContentClient() {
  const [home, setHome] = useState<HomeContent>(defaultHome);
  const [about, setAbout] = useState<AboutContent>(defaultAbout);
  const [contact, setContact] = useState<ContactContent>(defaultContact);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "about" | "contact">("home");

  const handleSave = () => {
    // TODO: wire to /api/site-content when backend is ready
    console.log("Saving:", { home, about, contact });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "home" as const,    label: "Home Page",    icon: Home  },
    { id: "about" as const,   label: "About Page",   icon: Info  },
    { id: "contact" as const, label: "Contact Page", icon: Phone },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Tab selector */}
      <div className="flex items-center gap-1 mb-6 bg-white border border-gray-200 rounded-sm p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all duration-200",
                active
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-700",
              ].join(" ")}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, #D4AF37 0%, #ffe87c 50%, #b8952e 100%)",
                      boxShadow: "0 2px 8px rgba(212,175,55,0.4)",
                    }
                  : undefined
              }
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── HOME TAB ── */}
      {activeTab === "home" && (
        <div className="space-y-4">
          <Section title="Hero Section" icon={Image} defaultOpen>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="col-span-2">
                <Field label="Announcement Bar Text">
                  <div className="flex gap-2 items-center">
                    <input
                      className={inputCls + " flex-1"}
                      value={home.announcementBar}
                      onChange={(e) =>
                        setHome({ ...home, announcementBar: e.target.value })
                      }
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={home.announcementEnabled}
                        onChange={(e) =>
                          setHome({ ...home, announcementEnabled: e.target.checked })
                        }
                        className="accent-[#D4AF37] w-4 h-4"
                      />
                      Enabled
                    </label>
                  </div>
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Hero Headline">
                  <input
                    className={inputCls}
                    value={home.hero.headline}
                    onChange={(e) =>
                      setHome({ ...home, hero: { ...home.hero, headline: e.target.value } })
                    }
                  />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Hero Subheadline">
                  <input
                    className={inputCls}
                    value={home.hero.subheadline}
                    onChange={(e) =>
                      setHome({ ...home, hero: { ...home.hero, subheadline: e.target.value } })
                    }
                  />
                </Field>
              </div>
              <Field label="CTA Button Text">
                <input
                  className={inputCls}
                  value={home.hero.ctaText}
                  onChange={(e) =>
                    setHome({ ...home, hero: { ...home.hero, ctaText: e.target.value } })
                  }
                />
              </Field>
              <Field label="CTA Link">
                <input
                  className={inputCls}
                  value={home.hero.ctaLink}
                  onChange={(e) =>
                    setHome({ ...home, hero: { ...home.hero, ctaLink: e.target.value } })
                  }
                />
              </Field>
              <div className="col-span-2">
                <Field label="Background Image URL" hint="Paste a full URL or leave blank to use default">
                  <input
                    className={inputCls}
                    placeholder="https://..."
                    value={home.hero.backgroundImage}
                    onChange={(e) =>
                      setHome({ ...home, hero: { ...home.hero, backgroundImage: e.target.value } })
                    }
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Feature Cards" icon={Type}>
            <div className="space-y-4 mt-4">
              {home.features.map((feat, i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-sm bg-gray-50 space-y-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                    Feature {i + 1}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Icon (emoji)">
                      <input
                        className={inputCls}
                        value={feat.icon}
                        onChange={(e) => {
                          const updated = [...home.features];
                          updated[i] = { ...updated[i], icon: e.target.value };
                          setHome({ ...home, features: updated });
                        }}
                      />
                    </Field>
                    <Field label="Title">
                      <input
                        className={inputCls}
                        value={feat.title}
                        onChange={(e) => {
                          const updated = [...home.features];
                          updated[i] = { ...updated[i], title: e.target.value };
                          setHome({ ...home, features: updated });
                        }}
                      />
                    </Field>
                    <Field label="Description">
                      <input
                        className={inputCls}
                        value={feat.description}
                        onChange={(e) => {
                          const updated = [...home.features];
                          updated[i] = { ...updated[i], description: e.target.value };
                          setHome({ ...home, features: updated });
                        }}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="About Snippet" icon={AlignLeft}>
            <div className="mt-4">
              <Field label="Short description shown on home page">
                <textarea
                  className={textareaCls}
                  rows={3}
                  value={home.aboutSnippet}
                  onChange={(e) => setHome({ ...home, aboutSnippet: e.target.value })}
                />
              </Field>
            </div>
          </Section>
        </div>
      )}

      {/* ── ABOUT TAB ── */}
      {activeTab === "about" && (
        <div className="space-y-4">
          <Section title="Page Header" icon={Type} defaultOpen>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Page Title">
                <input
                  className={inputCls}
                  value={about.pageTitle}
                  onChange={(e) => setAbout({ ...about, pageTitle: e.target.value })}
                />
              </Field>
              <Field label="Page Subtitle">
                <input
                  className={inputCls}
                  value={about.pageSubtitle}
                  onChange={(e) => setAbout({ ...about, pageSubtitle: e.target.value })}
                />
              </Field>
            </div>
          </Section>

          <Section title="Our Story" icon={AlignLeft}>
            <div className="space-y-4 mt-4">
              <Field label="Section Title">
                <input
                  className={inputCls}
                  value={about.storyTitle}
                  onChange={(e) => setAbout({ ...about, storyTitle: e.target.value })}
                />
              </Field>
              <Field label="Story Text">
                <textarea
                  className={textareaCls}
                  rows={5}
                  value={about.storyText}
                  onChange={(e) => setAbout({ ...about, storyText: e.target.value })}
                />
              </Field>
            </div>
          </Section>

          <Section title="Mission & Vision" icon={Info}>
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="space-y-3">
                <Field label="Mission Title">
                  <input
                    className={inputCls}
                    value={about.missionTitle}
                    onChange={(e) => setAbout({ ...about, missionTitle: e.target.value })}
                  />
                </Field>
                <Field label="Mission Text">
                  <textarea
                    className={textareaCls}
                    rows={4}
                    value={about.missionText}
                    onChange={(e) => setAbout({ ...about, missionText: e.target.value })}
                  />
                </Field>
              </div>
              <div className="space-y-3">
                <Field label="Vision Title">
                  <input
                    className={inputCls}
                    value={about.visionTitle}
                    onChange={(e) => setAbout({ ...about, visionTitle: e.target.value })}
                  />
                </Field>
                <Field label="Vision Text">
                  <textarea
                    className={textareaCls}
                    rows={4}
                    value={about.visionText}
                    onChange={(e) => setAbout({ ...about, visionText: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Founder / Team" icon={Image}>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Team Section Title">
                <input
                  className={inputCls}
                  value={about.teamTitle}
                  onChange={(e) => setAbout({ ...about, teamTitle: e.target.value })}
                />
              </Field>
              <Field label="Team Section Subtitle">
                <input
                  className={inputCls}
                  value={about.teamSubtitle}
                  onChange={(e) => setAbout({ ...about, teamSubtitle: e.target.value })}
                />
              </Field>
              <Field label="Founder Name">
                <input
                  className={inputCls}
                  value={about.founderName}
                  onChange={(e) => setAbout({ ...about, founderName: e.target.value })}
                />
              </Field>
              <Field label="Founder Role">
                <input
                  className={inputCls}
                  value={about.founderRole}
                  onChange={(e) => setAbout({ ...about, founderRole: e.target.value })}
                />
              </Field>
              <div className="col-span-2">
                <Field label="Founder Bio">
                  <textarea
                    className={textareaCls}
                    rows={3}
                    value={about.founderBio}
                    onChange={(e) => setAbout({ ...about, founderBio: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ── CONTACT TAB ── */}
      {activeTab === "contact" && (
        <div className="space-y-4">
          <Section title="Page Header" icon={Type} defaultOpen>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Page Title">
                <input
                  className={inputCls}
                  value={contact.pageTitle}
                  onChange={(e) => setContact({ ...contact, pageTitle: e.target.value })}
                />
              </Field>
              <Field label="Page Subtitle">
                <input
                  className={inputCls}
                  value={contact.pageSubtitle}
                  onChange={(e) => setContact({ ...contact, pageSubtitle: e.target.value })}
                />
              </Field>
            </div>
          </Section>

          <Section title="Contact Details" icon={MapPin}>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="col-span-2">
                <Field label="Physical Address">
                  <input
                    className={inputCls}
                    value={contact.address}
                    onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Phone Number">
                <input
                  className={inputCls}
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                />
              </Field>
              <Field label="Email Address">
                <input
                  className={inputCls}
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
              </Field>
              <div className="col-span-2">
                <Field label="Business Hours" hint="Each line = one row">
                  <textarea
                    className={textareaCls}
                    rows={3}
                    value={contact.hours}
                    onChange={(e) => setContact({ ...contact, hours: e.target.value })}
                  />
                </Field>
              </div>
              <div className="col-span-2">
                <Field
                  label="Google Maps Embed URL"
                  hint="Paste the src URL from Google Maps embed code"
                >
                  <input
                    className={inputCls}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    value={contact.mapEmbedUrl}
                    onChange={(e) => setContact({ ...contact, mapEmbedUrl: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Contact Form Text" icon={Mail}>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Form Title">
                <input
                  className={inputCls}
                  value={contact.formTitle}
                  onChange={(e) => setContact({ ...contact, formTitle: e.target.value })}
                />
              </Field>
              <Field label="Form Subtitle">
                <input
                  className={inputCls}
                  value={contact.formSubtitle}
                  onChange={(e) => setContact({ ...contact, formSubtitle: e.target.value })}
                />
              </Field>
            </div>
          </Section>
        </div>
      )}

      {/* ── Footer save bar ── */}
      <div className="mt-8 flex items-center justify-between bg-white border border-gray-200 rounded-sm px-6 py-4">
        <p className="text-sm text-gray-500">
          Changes are saved locally.{" "}
          <span className="text-gray-400">Backend integration coming soon.</span>
        </p>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-sm text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview Site
          </a>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-sm text-sm font-semibold text-black transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #ffe87c 50%, #b8952e 100%)",
              boxShadow: "0 2px 12px rgba(212,175,55,0.4)",
            }}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      <SaveToast show={saved} />
    </div>
  );
}
