"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { navLinks } from "@/components/Navbar";

const legal   = ["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"];
const support = ["FAQ", "Shipping & Delivery", "Returns & Refunds", "Contact Us", "Track Your Order"];
const services = ["Prescription Services", "Health Consultations", "Loyalty Programme", "Gift Cards", "Wholesale Enquiries"];

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      className="w-full border-t border-gray-200"
      style={{ backgroundColor: "#FAF8F5" }}
    >
      {/* Gold accent line */}
      <div
        className="h-[3px]"
        style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }}
      />



      {/* ── Main footer body ── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* ── Brand column ── */}
          <div className="md:col-span-4">
            {/* Logo */}
            <div className="mb-5">
              <h3
                className="text-4xl tracking-[-0.01em] mb-0.5"
                style={{
                  color: "#D4AF37",
                  fontFamily: "'Lucida Calligraphy', 'Lucida Handwriting', 'Palatino Linotype', cursive",
                  fontWeight: 400,
                }}
              >
                Rosewood
              </h3>
              <p className="text-[9px] tracking-[0.35em] uppercase font-sans font-semibold" style={{ color: "#555555" }}>
                Pharmacy & Wellness
              </p>
            </div>

            <p className="text-sm font-sans leading-relaxed mb-6" style={{ color: "#1A1A1A" }}>
              London's trusted destination for premium pharmacy, skincare, and wellness. We bring together the finest healthcare products with expert guidance — delivered to your door with care and discretion.
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6">
              {[
                { icon: "📍", text: "26 Wigmore Street, London W1U 2RH" },
                { icon: "📞", text: "+44 (0)20 7935 5555" },
                { icon: "✉️", text: "hello@rosewoodpharmacy.co.uk" },
                { icon: "🕐", text: "Mon–Sat 9:00am – 6:00pm" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-2.5">
                  <span className="text-xs mt-0.5">{item.icon}</span>
                  <p className="text-xs font-sans font-medium" style={{ color: "#1A1A1A" }}>{item.text}</p>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" },
                { label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                { label: "Twitter", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center transition-all duration-200 hover:border-[#D4AF37] hover:bg-[#D4AF37] group"
                >
                  <svg className="w-4 h-4 transition-colors" fill="currentColor" viewBox="0 0 24 24"
                    style={{ color: "#1A1A1A" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#1A1A1A")}
                  >
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* ── Links columns ── */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-10">

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] font-sans mb-6 pb-2 border-b border-gray-200" style={{ color: "#1A1A1A" }}>
                Quick Links
              </h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="footer-link text-sm font-sans font-medium transition-colors duration-200 flex items-center gap-1.5 group"
                      style={{ color: "#1A1A1A" }}
                    >
                      <span className="w-1 h-1 rounded-full bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] font-sans mb-6 pb-2 border-b border-gray-200" style={{ color: "#1A1A1A" }}>
                Our Services
              </h4>
              <ul className="space-y-3">
                {services.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="footer-link text-sm font-sans font-medium transition-colors duration-200 flex items-center gap-1.5 group"
                      style={{ color: "#1A1A1A" }}
                    >
                      <span className="w-1 h-1 rounded-full bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support + Legal */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] font-sans mb-6 pb-2 border-b border-gray-200" style={{ color: "#1A1A1A" }}>
                Help & Legal
              </h4>
              <ul className="space-y-3 mb-6">
                {support.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="footer-link text-sm font-sans font-medium transition-colors duration-200 flex items-center gap-1.5 group"
                      style={{ color: "#1A1A1A" }}
                    >
                      <span className="w-1 h-1 rounded-full bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-gray-200">
                {legal.map((item) => (
                  <Link
                    key={item}
                    href="#"
                    className="footer-link block text-xs font-sans transition-colors duration-200 mb-2"
                    style={{ color: "#333333" }}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>



        {/* ── Bottom bar ── */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-sans font-medium" style={{ color: "#333333" }}>
            © {new Date().getFullYear()} Rosewood Pharmacy Ltd. All rights reserved. Registered in England & Wales.
          </p>

          {/* Payment Methods */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {[
              { bg: "#016FD0", el: <span className="text-[8px] font-black text-white leading-tight text-center">AM<br/>EX</span> },
              { bg: "white", border: true, el: <span className="text-[9px] font-semibold text-black">⬤ Pay</span> },
              { bg: "white", border: true, el: <span className="text-[9px] font-semibold"><span style={{color:"#4285F4"}}>G</span><span style={{color:"#34A853"}}>o</span><span style={{color:"#FBBC05"}}>o</span><span style={{color:"#4285F4"}}> Pay</span></span> },
              { bg: "#FFB3C7", el: <span className="text-[9px] font-bold text-black">Klarna</span> },
              { bg: "#252525", el: <svg viewBox="0 0 38 24" className="w-9 h-6"><circle cx="14" cy="12" r="8" fill="#EB001B"/><circle cx="24" cy="12" r="8" fill="#F79E1B"/><path d="M19 6.27A8 8 0 0 1 22.93 12 8 8 0 0 1 19 17.73 8 8 0 0 1 15.07 12 8 8 0 0 1 19 6.27z" fill="#FF5F00"/></svg> },
              { bg: "white", border: true, el: <span className="text-[9px] font-bold"><span style={{color:"#003087"}}>Pay</span><span style={{color:"#009CDE"}}>Pal</span></span> },
              { bg: "#5A31F4", el: <span className="text-[9px] font-bold text-white">shop</span> },
              { bg: "#1A1F71", el: <span className="text-[11px] font-black text-white italic tracking-wide">VISA</span> },
            ].map((card, i) => (
              <div
                key={i}
                className="w-12 h-8 rounded-md flex items-center justify-center px-1.5"
                style={{ backgroundColor: card.bg, border: card.border ? "1px solid #e5e7eb" : undefined }}
              >
                {card.el}
              </div>
            ))}
          </div>

          <p className="text-[11px] font-sans font-medium" style={{ color: "#333333" }}>
            GPhC Reg. No. 1234567 ✦ ICO Reg. No. ZA123456
          </p>
        </div>
      </div>

      <style>{`
        .footer-link:hover {
          color: #D4AF37 !important;
        }
      `}</style>
    </footer>
  );
}
