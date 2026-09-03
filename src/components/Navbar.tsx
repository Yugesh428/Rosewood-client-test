"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Nav links ────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Home",     href: "/"         },
  { label: "Pharmacy", href: "/pharmacy" },
  { label: "About Us", href: "/about"    },
  { label: "Contact",  href: "/contact"  },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function WishlistIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  productName: string;
  productImage: string | null;
  sellingPrice: number;
  category?: { categoryName: string };
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const router  = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/products?search=${encodeURIComponent(q)}&isActive=true&limit=6`);
      const json = await res.json();
      setResults(json.success ? (json.data ?? []) : []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(() => search(val), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      setOpen(false);
      router.push(`/pharmacy?search=${encodeURIComponent(query.trim())}`);
    }
    if (e.key === "Escape") setOpen(false);
  };

  const handleResultClick = (id: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/pharmacy/${id}`);
  };

  const handleViewAll = () => {
    setOpen(false);
    router.push(`/pharmacy?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
        className={`w-full bg-white/15 border border-white/30 text-white placeholder:text-white/50 text-xs px-3 pr-8 rounded-sm focus:outline-none focus:border-[#FFD700] transition-colors font-sans ${mobile ? "py-2" : "py-1.5"}`}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none">
        {loading ? (
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ) : <SearchIcon />}
      </span>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-white/10 rounded-sm shadow-2xl z-50 overflow-hidden"
          >
            <ul>
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => handleResultClick(product.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.08] transition-colors text-left"
                  >
                    {/* Thumbnail */}
                    <div className="w-8 h-8 rounded-sm bg-white/10 flex-shrink-0 overflow-hidden">
                      {product.productImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.productImage}
                          alt={product.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#D4AF37] text-xs font-bold">
                          {product.productName.charAt(0)}
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate font-sans">{product.productName}</p>
                      <p className="text-[10px] text-white/40 font-sans truncate">
                        {product.category?.categoryName ?? ""}
                      </p>
                    </div>
                    {/* Price */}
                    <span className="text-xs font-semibold text-[#D4AF37] flex-shrink-0 font-sans">
                      £{Number(product.sellingPrice).toFixed(2)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={handleViewAll}
              className="w-full px-3 py-2 text-[11px] text-[#D4AF37] hover:bg-white/5 transition-colors text-center border-t border-white/10 font-sans"
            >
              View all results for &quot;{query}&quot; →
            </button>
          </motion.div>
        )}
        {open && !loading && results.length === 0 && query.trim().length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-white/10 rounded-sm shadow-2xl z-50"
          >
            <p className="px-3 py-3 text-xs text-white/40 font-sans text-center">No products found.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Account Dropdown ─────────────────────────────────────────────────────────

function AccountDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Account"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`hover:text-[#FFD700] transition-colors ${open ? "text-[#FFD700]" : "text-white"}`}
      >
        <UserIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-8 w-52 bg-[#1A1A1A] border border-white/10 rounded-sm shadow-xl overflow-hidden z-50"
          >
            <div className="px-4 pt-3 pb-1">
              <p className="text-[9px] tracking-[0.25em] uppercase text-white/30 font-sans">Customer</p>
            </div>
            <Link href="/login" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-xs text-white hover:text-white hover:bg-white/10 transition-colors font-sans">
              <UserIcon /> Sign in
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-xs text-white hover:text-white hover:bg-white/10 transition-colors font-sans">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Create account
            </Link>

            <div className="mx-4 my-1 border-t border-white/10" />

            <div className="px-4 pt-2 pb-1">
              <p className="text-[9px] tracking-[0.25em] uppercase text-[#D4AF37]/50 font-sans">Admin</p>
            </div>
            <Link href="/admin/login" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 mb-1 text-xs text-[#FFD700] hover:text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors font-sans drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
              <ShieldIcon /> Admin portal
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "backdrop-blur-md shadow-lg" : ""
        }`}
        style={{ backgroundColor: "var(--color-bg-nav)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-heading text-sm tracking-[0.2em] uppercase leading-tight"
              style={{ color: "var(--color-primary)" }}>
              Rosewood<br />
              <span className="text-[10px] tracking-[0.35em]">Pharmacy</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}
                  className="group relative text-white hover:text-[#FFD700] text-xs tracking-wide uppercase transition-colors duration-200 font-sans pb-0.5">
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-full h-px bg-[#FFD700] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Search — desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-xs">
            <SearchBar />
          </div>

          {/* Desktop icons */}
          <div className="hidden md:flex items-center gap-4 text-white">
            <button aria-label="Wishlist" className="hover:text-[#FFD700] transition-colors">
              <WishlistIcon />
            </button>
            <button aria-label="Cart" className="hover:text-[#FFD700] transition-colors relative">
              <CartIcon />
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#FFD700] text-black text-[8px] font-bold rounded-full flex items-center justify-center">
                0
              </span>
            </button>
            <AccountDropdown />
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white hover:text-[#FFD700] transition-colors"
            onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-6 pb-3">
          <SearchBar mobile />
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-40 w-72 bg-[#000000] border-l border-white/10 flex flex-col pt-20 px-8"
          >
            <ul className="space-y-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={() => setMobileOpen(false)}
                    className="text-white hover:text-[#FFD700] text-sm tracking-widest uppercase transition-colors font-sans">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-white/10 pt-8 space-y-4">
              <p className="text-[9px] tracking-[0.25em] uppercase text-white/30 font-sans">Account</p>
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-xs text-white hover:text-[#FFD700] transition-colors font-sans">
                <UserIcon /> Customer Sign in
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-xs text-white hover:text-[#FFD700] transition-colors font-sans">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Create account
              </Link>
              <Link href="/admin/login" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-xs text-[#FFD700] hover:text-[#FFD700] drop-shadow-[0_0_6px_rgba(255,215,0,0.5)] transition-colors font-sans">
                <ShieldIcon /> Admin portal
              </Link>
            </div>

            <div className="mt-8 flex gap-6 text-white">
              <button aria-label="Wishlist" className="hover:text-[#FFD700] transition-colors"><WishlistIcon /></button>
              <button aria-label="Cart" className="hover:text-[#FFD700] transition-colors"><CartIcon /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
