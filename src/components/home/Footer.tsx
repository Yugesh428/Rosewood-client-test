import Link from "next/link";

const legal = ["Privacy Policy", "Terms of Service", "Cookie Policy"];
const support = ["FAQ", "Shipping", "Returns", "Contact Us"];

export default function Footer() {
  return (
    <footer className="bg-[#000000] border-t border-white/10">
      {/* Bright gold accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <p className="text-xs tracking-[0.35em] uppercase text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)] font-sans mb-1">
              Rosewood
            </p>
            <h3 className="font-heading text-white text-xl mb-4 drop-shadow-[0_0_4px_rgba(255,255,255,0.2)]">
              Pharmacy
            </h3>
            <p className="text-white/55 text-xs font-sans leading-relaxed max-w-xs">
              A curated collection of premium healthcare, wellness, and skincare products delivered with discretion and care to your door.
            </p>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white text-xs tracking-[0.2em] uppercase font-sans mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              {legal.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-white/55 hover:text-[#FFD700] text-xs font-sans transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white text-xs tracking-[0.2em] uppercase font-sans mb-5">
              Support
            </h4>
            <ul className="space-y-3">
              {support.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-white/55 hover:text-[#FFD700] text-xs font-sans transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/35 text-[10px] font-sans tracking-wide">
            © {new Date().getFullYear()} Rosewood Pharmacy. All rights reserved.
          </p>
          <p className="text-[#FFD700]/60 text-[10px] font-sans tracking-wide drop-shadow-[0_0_4px_rgba(255,215,0,0.3)]">
            Crafted with care ✦ Delivered with precision
          </p>
        </div>
      </div>
    </footer>
  );
}
