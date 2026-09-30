"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Tag,
  Warehouse,
  ShoppingCart,
  Users,
  Briefcase,
  Star,
  MessageSquare,
  Settings,
  LogOut,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  Globe,
  Palette,
  FileBarChart,
  LineChart,
  FileText,
  Headphones,
  UserCheck,
  Scale,
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

interface NavSection {
  icon: React.ElementType;
  label: string;
  items: NavItem[];
}

const navSections: (NavItem | NavSection)[] = [
  { icon: LayoutDashboard, label: "DASHBOARD", href: "/admin/dashboard" },
  {
    icon: Package,
    label: "CATALOGUE",
    items: [
      { icon: Package, label: "Products", href: "/admin/products" },
      { icon: Tag, label: "Categories", href: "/admin/categories" },
      { icon: Warehouse, label: "Inventory", href: "/admin/inventory" },
    ],
  },
  {
    icon: ShoppingCart,
    label: "SALES",
    items: [
      { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
      { icon: Users, label: "Customers", href: "/admin/customers" },
      { icon: LineChart, label: "Analytics", href: "/admin/analytics" },
      { icon: FileBarChart, label: "Reports", href: "/admin/reports" },
    ],
  },
  {
    icon: Users,
    label: "TEAM",
    items: [
      { icon: Briefcase, label: "Staff", href: "/admin/staff" },
      { icon: Star, label: "Reviews", href: "/admin/reviews" },
      { icon: MessageSquare, label: "Feedback", href: "/admin/feedback" },
    ],
  },
  {
    icon: Globe,
    label: "CONTENT",
    items: [
      { icon: Globe, label: "Site Content", href: "/admin/site-content" },
      { icon: FileText, label: "Blogs", href: "/admin/blogs" },
      { icon: Palette, label: "Theme", href: "/admin/theme-settings" },
    ],
  },
  {
    icon: Headphones,
    label: "SUPPORT",
    items: [
      { icon: Headphones, label: "Tickets", href: "/admin/support" },
      { icon: HelpCircle, label: "FAQ", href: "/admin/faq" },
      { icon: UserCheck, label: "Careers", href: "/admin/careers" },
      { icon: Scale, label: "Terms", href: "/admin/terms" },
    ],
  },
  { icon: Settings, label: "SETTINGS", href: "/admin/settings" },
];

const STORAGE_KEY = "rosewood_sidebar_collapsed";
const EXPANDED_SECTIONS_KEY = "rosewood_sidebar_expanded_sections";

function isNavSection(item: NavItem | NavSection): item is NavSection {
  return "items" in item;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) === "true";
    const savedExpanded = localStorage.getItem(EXPANDED_SECTIONS_KEY);
    setCollapsed(saved);
    if (savedExpanded) {
      try {
        setExpandedSections(new Set(JSON.parse(savedExpanded)));
      } catch {
        setExpandedSections(new Set());
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(EXPANDED_SECTIONS_KEY, JSON.stringify([...expandedSections]));
  }, [expandedSections, mounted]);

  // Auto-expand section if current page is in it
  useEffect(() => {
    navSections.forEach((section) => {
      if (isNavSection(section)) {
        const hasActivePage = section.items.some((item) => pathname.startsWith(item.href));
        if (hasActivePage && !expandedSections.has(section.label)) {
          setExpandedSections((prev) => new Set(prev).add(section.label));
        }
      }
    });
  }, [pathname, expandedSections]);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarWidth = collapsed ? "w-[68px]" : "w-64";

  return (
    <>
      {/* ── Fixed sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 flex flex-col ${sidebarWidth} transition-[width] duration-300 ease-in-out`}
        style={{
          background: "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.3), inset -1px 0 0 rgba(212,175,55,0.1)",
          borderRight: "1px solid rgba(212,175,55,0.15)",
        }}
      >
        {/* Shiny top gold line */}
        <div
          className="h-[3px] w-full flex-shrink-0"
          style={{
            background: "#D4AF37",
          }}
        />

        {/* ── Logo ── */}
        <div
          className={`flex-shrink-0 border-b overflow-hidden ${collapsed ? "px-3 py-4" : "px-6 py-5"}`}
          style={{ borderColor: "rgba(212,175,55,0.2)" }}
        >
          {collapsed ? (
            <div className="flex items-center justify-center">
              <span
                className="text-3xl font-bold"
                style={{ 
                  fontFamily: "var(--font-cinzel), 'Cinzel', serif",
                  color: "#D4AF37",
                  textShadow: "0 2px 8px rgba(212,175,55,0.4)"
                }}
              >
                R
              </span>
            </div>
          ) : (
            <Link href="/admin/dashboard">
              <h1 
                className="text-2xl font-bold mb-1 leading-tight tracking-wider uppercase" 
                style={{ 
                  fontFamily: "var(--font-cinzel), 'Cinzel', serif",
                  color: "#D4AF37",
                  textShadow: "0 2px 10px rgba(212,175,55,0.3)",
                  letterSpacing: "0.08em"
                }}
              >
                Rosewood
              </h1>
              <p
                className="text-[10px] tracking-[0.35em] uppercase font-montserrat font-bold"
                style={{ color: "#D4AF37" }}
              >
                ADMIN
              </p>
            </Link>
          )}
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          <ul className={`space-y-0.5 ${collapsed ? "px-2" : "px-3"}`}>
            {navSections.map((item) => {
              if (!isNavSection(item)) {
                // Regular nav item
                const Icon = item.icon;
                const active = isActive(item.href);
                const hovered = hoveredHref === item.href;
                const highlighted = active || hovered;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={item.label}
                      onMouseEnter={() => setHoveredHref(item.href)}
                      onMouseLeave={() => setHoveredHref(null)}
                      className={[
                        "flex items-center rounded-sm transition-all duration-200 relative overflow-hidden",
                        collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5",
                      ].join(" ")}
                      style={
                        highlighted
                          ? {
                              background:
                                "linear-gradient(90deg, rgba(255,232,124,0.15) 0%, rgba(212,175,55,0.10) 60%, rgba(212,175,55,0.04) 100%)",
                              boxShadow:
                                "inset 0 0 0 1px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,232,124,0.15)",
                            }
                          : { background: "transparent" }
                      }
                    >
                      {/* Gold left bar */}
                      {highlighted && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full"
                          style={{
                            background:
                              "linear-gradient(180deg, #ffe87c 0%, #D4AF37 50%, #b8952e 100%)",
                            boxShadow: "0 0 8px rgba(212,175,55,0.6)",
                          }}
                        />
                      )}

                      <Icon
                        className="flex-shrink-0 w-[18px] h-[18px] transition-all duration-200"
                        style={
                          highlighted
                            ? {
                                color: "#D4AF37",
                                filter:
                                  "drop-shadow(0 0 6px rgba(255,232,124,0.9)) drop-shadow(0 0 12px rgba(212,175,55,0.6))",
                              }
                            : { color: "#ffffff" }
                        }
                      />

                      {!collapsed && (
                        <>
                          <span
                            className={`tracking-[0.12em] text-[11px] uppercase ${active ? "font-bold" : "font-semibold"}`}
                            style={
                              highlighted
                                ? {
                                    background:
                                      "linear-gradient(135deg, #ffe87c 0%, #D4AF37 40%, #ffe87c 70%, #b8952e 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    filter: "drop-shadow(0 0 6px rgba(255,232,124,0.4))",
                                  }
                                : {
                                    color: "#ffffff",
                                  }
                            }
                          >
                            {item.label}
                          </span>
                          {item.badge ? (
                            <span
                              className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-sm text-black"
                              style={{
                                background: "linear-gradient(135deg, #ffe87c 0%, #D4AF37 100%)",
                              }}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      )}
                    </Link>
                  </li>
                );
              } else {
                // Section with sub-items
                const Icon = item.icon;
                const isExpanded = expandedSections.has(item.label);
                const hasActivePage = item.items.some((subItem) => isActive(subItem.href));
                const hovered = hoveredHref === item.label;
                const highlighted = hasActivePage || hovered;

                return (
                  <li key={item.label}>
                    {/* Section header */}
                    <button
                      type="button"
                      onClick={() => !collapsed && toggleSection(item.label)}
                      onMouseEnter={() => setHoveredHref(item.label)}
                      onMouseLeave={() => setHoveredHref(null)}
                      className={[
                        "flex items-center w-full rounded-sm transition-all duration-200 relative overflow-hidden",
                        collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5",
                      ].join(" ")}
                      style={
                        highlighted
                          ? {
                              background:
                                "linear-gradient(90deg, rgba(255,232,124,0.12) 0%, rgba(212,175,55,0.08) 60%, rgba(212,175,55,0.04) 100%)",
                              boxShadow:
                                "inset 0 0 0 1px rgba(212,175,55,0.25)",
                            }
                          : { background: "transparent" }
                      }
                    >
                      <Icon
                        className="flex-shrink-0 w-[18px] h-[18px] transition-all duration-200"
                        style={
                          highlighted
                            ? {
                                color: "#D4AF37",
                                filter: "drop-shadow(0 0 4px rgba(212,175,55,0.6))",
                              }
                            : { color: "#ffffff" }
                        }
                      />

                      {!collapsed && (
                        <>
                          <span
                            className="tracking-[0.12em] text-[11px] uppercase font-semibold flex-1 text-left"
                            style={
                              highlighted
                                ? {
                                    background:
                                      "linear-gradient(135deg, #ffe87c 0%, #D4AF37 50%, #b8952e 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                  }
                                : { color: "#ffffff" }
                            }
                          >
                            {item.label}
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            style={{ color: highlighted ? "#D4AF37" : "#ffffff" }}
                          />
                        </>
                      )}
                    </button>

                    {/* Sub-items */}
                    {!collapsed && isExpanded && (
                      <ul className="mt-0.5 ml-4 space-y-0.5 border-l" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
                        {item.items.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const active = isActive(subItem.href);
                          const subHovered = hoveredHref === subItem.href;
                          const subHighlighted = active || subHovered;

                          return (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                title={subItem.label}
                                onMouseEnter={() => setHoveredHref(subItem.href)}
                                onMouseLeave={() => setHoveredHref(null)}
                                className="flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-sm transition-all duration-200 relative"
                                style={
                                  subHighlighted
                                    ? {
                                        background: "rgba(212,175,55,0.06)",
                                        boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.2)",
                                      }
                                    : { background: "transparent" }
                                }
                              >
                                {active && (
                                  <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full"
                                    style={{
                                      background: "linear-gradient(180deg, #ffe87c 0%, #D4AF37 100%)",
                                    }}
                                  />
                                )}
                                <SubIcon
                                  className="flex-shrink-0 w-[14px] h-[14px]"
                                  style={{ color: subHighlighted ? "#D4AF37" : "#E5E5E5" }}
                                />
                                <span
                                  className={`text-[10px] tracking-[0.08em] uppercase ${active ? "font-semibold" : "font-medium"}`}
                                  style={{ color: subHighlighted ? "#D4AF37" : "#F5F5F5" }}
                                >
                                  {subItem.label}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }
            })}
          </ul>
        </nav>

        {/* Shiny divider */}
        <div
          className="mx-4 mb-3 h-px flex-shrink-0"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
          }}
        />

        {/* ── Bottom actions ── */}
        <div className={`flex-shrink-0 pb-4 space-y-0.5 ${collapsed ? "px-2" : "px-3"}`}>
          {[
            { href: "/", icon: Home, label: "Back to Home" },
          ].map(({ href, icon: Icon, label }) => {
            const hovered = hoveredHref === href;
            return (
              <Link
                key={href}
                href={href}
                title={label}
                onMouseEnter={() => setHoveredHref(href)}
                onMouseLeave={() => setHoveredHref(null)}
                className={[
                  "flex items-center rounded-sm transition-all duration-200 relative overflow-hidden",
                  collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5",
                ].join(" ")}
                style={
                  hovered
                    ? {
                        background:
                          "linear-gradient(90deg, rgba(255,232,124,0.12) 0%, rgba(212,175,55,0.08) 100%)",
                        boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.25)",
                      }
                    : { background: "transparent" }
                }
              >
                <Icon
                  className="flex-shrink-0 w-[18px] h-[18px] transition-all duration-200"
                  style={
                    hovered
                      ? { color: "#D4AF37", filter: "drop-shadow(0 0 4px rgba(212,175,55,0.6))" }
                      : { color: "#ffffff" }
                  }
                />
                {!collapsed && (
                  <span
                    className="tracking-[0.12em] text-[11px] uppercase font-semibold"
                    style={
                      hovered
                        ? {
                            background:
                              "linear-gradient(135deg, #ffe87c 0%, #D4AF37 50%, #b8952e 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }
                        : { color: "#ffffff" }
                    }
                  >
                    {label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Logout */}
          {(() => {
            const hovered = hoveredHref === "__logout__";
            return (
              <button
                type="button"
                title="Logout"
                onMouseEnter={() => setHoveredHref("__logout__")}
                onMouseLeave={() => setHoveredHref(null)}
                className={[
                  "flex items-center rounded-sm transition-all duration-200 w-full relative overflow-hidden",
                  collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5",
                ].join(" ")}
                style={
                  hovered
                    ? {
                        background: "rgba(239,68,68,0.08)",
                        boxShadow: "inset 0 0 0 1px rgba(239,68,68,0.2)",
                      }
                    : { background: "transparent" }
                }
                onClick={() => { window.location.href = "/api/auth/signout"; }}
              >
                <LogOut
                  className="flex-shrink-0 w-[18px] h-[18px] transition-all duration-200"
                  style={hovered ? { color: "#f87171" } : { color: "#ffffff" }}
                />
                {!collapsed && (
                  <span
                    className="tracking-[0.12em] text-[11px] uppercase font-semibold"
                    style={
                      hovered
                        ? { color: "#f87171" }
                        : { color: "#ffffff" }
                    }
                  >
                    Logout
                  </span>
                )}
              </button>
            );
          })()}
        </div>

        {/* ── Collapse/expand toggle button ── */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="absolute top-1/2 -translate-y-1/2 -right-3.5 z-50 flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #1c1c1c 0%, #141414 100%)",
            border: "1px solid rgba(212,175,55,0.4)",
            boxShadow: "0 0 10px rgba(212,175,55,0.2), 0 2px 8px rgba(0,0,0,0.5)",
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight
              className="w-3.5 h-3.5"
              style={{ color: "#D4AF37", filter: "drop-shadow(0 0 4px rgba(212,175,55,0.6))" }}
            />
          ) : (
            <ChevronLeft
              className="w-3.5 h-3.5"
              style={{ color: "#D4AF37", filter: "drop-shadow(0 0 4px rgba(212,175,55,0.6))" }}
            />
          )}
        </button>
      </aside>

      {/* ── Spacer — pushes main content by sidebar width ── */}
      <div className={`flex-shrink-0 ${sidebarWidth} transition-[width] duration-300 ease-in-out`} />
    </>
  );
}





