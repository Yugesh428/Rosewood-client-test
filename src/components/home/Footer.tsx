"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { navLinks } from "@/components/Navbar";

const legal   = ["Privacy Policy", "Terms of Service", "Cookie Policy"];
const support = ["FAQ", "Shipping", "Returns", "Contact Us"];

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      className="w-full border-t border-white/10"
      style={{ backgroundColor: theme?.bgNav ?? "#000000" }}
    >
      {/* Accent line */}
      <div
        className="h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, var(--color-primary), transparent)", opacity: 0.8 }}
      />

      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* ── Brand ── */}
          <div className="md:col-span-2">
            <div className="flex flex-col items-center leading-tight mb-4 w-fit">
              <h3
                className="font-heading text-3xl tracking-[-0.01em]"
                style={{ color: "var(--color-primary)", textShadow: "0 0 18px rgba(212,175,55,0.3)" }}
              >
                Rosewood
              </h3>
              <p className="text-[9px] tracking-[0.28em] uppercase font-sans text-white/50 mt-0.5">
                Pharmacy
              </p>
            </div>

            <p
              className="text-xs font-sans leading-relaxed max-w-xs mb-6"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              A curated collection of premium healthcare, wellness, and skincare
              products delivered with discretion and care to your door.
            </p>

            {/* ── Navigation links (moved from navbar) ── */}
            <nav>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="footer-nav-link text-xs font-sans tracking-wide uppercase transition-colors duration-200"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ── Legal ── */}
          <div>
            <h4
              className="text-xs tracking-[0.2em] uppercase font-sans mb-5"
              style={{ color: "#ffffff", textShadow: "0 0 14px rgba(255,255,255,0.5)" }}
            >
              Legal
            </h4>
            <ul className="space-y-3">
              {legal.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="footer-link text-xs font-sans transition-colors duration-200"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support ── */}
          <div>
            <h4
              className="text-xs tracking-[0.2em] uppercase font-sans mb-5"
              style={{ color: "#ffffff", textShadow: "0 0 14px rgba(255,255,255,0.5)" }}
            >
              Support
            </h4>
            <ul className="space-y-3">
              {support.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="footer-link text-xs font-sans transition-colors duration-200"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-[10px] font-sans tracking-wide"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            © {new Date().getFullYear()} Rosewood Pharmacy. All rights reserved.
          </p>
          <p
            className="text-[10px] font-sans tracking-wide"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Crafted with care ✦ Delivered with precision
          </p>
        </div>
      </div>

      {/* Scoped hover styles */}
      <style>{`
        .footer-link:hover,
        .footer-nav-link:hover {
          color: var(--color-primary) !important;
          text-shadow: 0 0 10px rgba(212,175,55,0.4) !important;
        }
      `}</style>
    </footer>
  );
}
