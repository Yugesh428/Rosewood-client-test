"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, ChevronRight, Lock, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const { data: session, status: sessionStatus } = useSession();
  const { items, totalPrice, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "online" | "upi">("card");

  // Contact
  const [email, setEmail]     = useState("");
  // Delivery
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [company,   setCompany]   = useState("");
  const [address,   setAddress]   = useState("");
  const [apt,       setApt]       = useState("");
  const [city,      setCity]      = useState("");
  const [postcode,  setPostcode]  = useState("");
  const [phone,     setPhone]     = useState("");
  // Discount
  const [discountCode, setDiscountCode] = useState("");
  // Notes
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const isGuest         = sessionStatus === "unauthenticated";
  const isAuthenticated = sessionStatus === "authenticated" && !!session?.user;

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-heading text-[#1A1A1A] mb-4">Your cart is empty</p>
          <Link href="/pharmacy" className="inline-block px-6 py-2.5 bg-[#D4AF37] text-white font-semibold rounded hover:bg-[#b8952e] transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = totalPrice;
  const shipping = 0;
  const total    = subtotal + shipping;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fullAddress = [address, apt, city, postcode].filter(Boolean).join(", ");

    if (isGuest && !email.trim())       { toast.error("Please enter your email"); return; }
    if (!firstName.trim())              { toast.error("Please enter your first name"); return; }
    if (!address.trim())                { toast.error("Please enter your address"); return; }

    setLoading(true);
    const toastId = toast.loading("Processing your order...");

    try {
      const orderItems = await Promise.all(
        items.map(async (item) => {
          let inventoryId = item.inventoryId;
          if (!inventoryId) {
            const r = await fetch(`/api/inventory?productId=${item.id}&isActive=true&limit=1`);
            const j = await r.json();
            if (j.success && j.data?.length > 0) inventoryId = j.data[0].id as string;
            else throw new Error(`No inventory for "${item.name}"`);
          }
          return { productId: item.id, inventoryId, quantity: item.quantity };
        })
      );

      const payload = isGuest
        ? { isGuest: true, guestName: `${firstName} ${lastName}`.trim(), guestEmail: email.trim().toLowerCase(), guestPhone: phone.trim(), paymentMethod, deliveryAddress: fullAddress, deliveryNotes: deliveryNotes.trim() || undefined, items: orderItems }
        : { isGuest: false, customerId: (session!.user as { id: string }).id, paymentMethod, deliveryAddress: fullAddress, deliveryNotes: deliveryNotes.trim() || undefined, items: orderItems };

      const res  = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Order creation failed");

      await fetch(`/api/orders/${json.data.id}/payment`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentStatus: "paid" }) });

      const orderId = json.data.id as string;
      const shortId = orderId.slice(0, 8).toUpperCase();

      try { sessionStorage.setItem("orderSuccess", JSON.stringify({ orderId, shortId, ts: Date.now() })); } catch { /* ignore */ }

      toast.success(`Order #${shortId} placed!`, { id: toastId, description: "Redirecting...", duration: 3000 });
      setTimeout(() => {
        clearCart();
        window.location.href = `/order-confirmation/${orderId}?email=${isGuest ? encodeURIComponent(email) : ""}&new=1`;
      }, 600);

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong", { id: toastId });
      setLoading(false);
    }
  }

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors bg-white placeholder:text-gray-400";

  return (
    <div className="min-h-screen bg-white">
      {/* ── Checkout Header ── */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-heading text-xl text-[#1A1A1A] tracking-wide">Rosewood</span>
            <span className="text-[8px] tracking-[0.25em] uppercase font-sans text-gray-400">Pharmacy</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-sans">
            <Link href="/pharmacy" className="hover:text-[#D4AF37] transition-colors">Cart</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 font-medium">Information</span>
            <ChevronRight className="w-3 h-3" />
            <span>Shipping</span>
            <ChevronRight className="w-3 h-3" />
            <span>Payment</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-sans">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure checkout</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-57px)]">

          {/* ── LEFT — Forms ── */}
          <div className="flex-1 px-6 md:px-12 lg:px-16 py-8 lg:max-w-[55%] lg:border-r border-gray-100">

            {/* Express checkout */}
            <div className="mb-6">
              <p className="text-xs text-center text-gray-400 mb-3 font-sans uppercase tracking-widest">Express checkout</p>
              <div className="flex gap-3">
                <button type="button" className="flex-1 py-3 rounded-md bg-[#5A31F4] flex items-center justify-center text-white text-sm font-bold tracking-wide hover:opacity-90 transition-opacity shadow-sm">
                  <span className="text-white font-bold">shop</span>
                </button>
                <button type="button" className="flex-1 py-3 rounded-md bg-[#FFC439] flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm">
                  <span className="text-[#003087] text-sm font-bold">Pay<span className="text-[#009CDE]">Pal</span></span>
                </button>
                <button type="button" className="flex-1 py-3 rounded-md bg-black flex items-center justify-center gap-1 hover:opacity-90 transition-opacity shadow-sm">
                  <span className="text-white text-sm font-light">G</span><span className="text-white text-sm font-medium">Pay</span>
                </button>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-sans">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </div>

            {/* ── Contact ── */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900 font-sans uppercase tracking-wider">Contact</h2>
                {isGuest && (
                  <Link href="/login" className="text-xs text-[#D4AF37] hover:underline font-sans">Sign in</Link>
                )}
              </div>
              {isAuthenticated ? (
                <div className={`${inputClass} text-gray-600`}>{session!.user.email}</div>
              ) : (
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className={inputClass}
                  required
                />
              )}
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 accent-[#D4AF37]" defaultChecked />
                <span className="text-xs text-gray-500 font-sans">Email me with news and offers</span>
              </label>
            </div>

            {/* ── Delivery ── */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-900 font-sans uppercase tracking-wider mb-3">Delivery</h2>

              {/* Country */}
              <div className="mb-3">
                <select className={inputClass}>
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </div>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className={inputClass} required />
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className={inputClass} />
              </div>

              {/* Company */}
              <div className="mb-3">
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company (optional)" className={inputClass} />
              </div>

              {/* Address */}
              <div className="mb-3">
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" className={inputClass} required />
              </div>

              {/* Apt */}
              <div className="mb-3">
                <input type="text" value={apt} onChange={e => setApt(e.target.value)} placeholder="Apartment, suite, etc. (optional)" className={inputClass} />
              </div>

              {/* City / Postcode */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className={inputClass} />
                <input type="text" value={postcode} onChange={e => setPostcode(e.target.value)} placeholder="Postcode" className={inputClass} />
              </div>

              {/* Phone */}
              <div className="mb-3">
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className={inputClass} />
              </div>

              {/* Notes */}
              <div>
                <textarea value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value)} placeholder="Delivery notes (optional)" rows={2} className={`${inputClass} resize-none`} />
              </div>
            </div>

            {/* ── Shipping method ── */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-900 font-sans uppercase tracking-wider mb-3">Shipping method</h2>
              <div className="border border-gray-200 rounded-md p-4 text-xs text-gray-400 font-sans bg-gray-50">
                Enter your shipping address to view available shipping methods.
              </div>
            </div>

            {/* ── Payment ── */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-900 font-sans uppercase tracking-wider mb-1">Payment</h2>
              <p className="text-xs text-gray-400 font-sans mb-3">All transactions are secure and encrypted.</p>

              <div className="border border-gray-200 rounded-md overflow-hidden">
                {/* Credit card option */}
                <label className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${paymentMethod === "card" ? "bg-[#fdfbf4]" : "bg-white"} border-b border-gray-200`}>
                  <input type="radio" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="w-4 h-4 accent-[#D4AF37]" />
                  <span className="text-sm font-sans font-medium flex-1">Credit card</span>
                  <div className="flex gap-1">
                    <span className="w-8 h-5 bg-[#016FD0] rounded text-[7px] font-black text-white flex items-center justify-center leading-tight">AM<br/>EX</span>
                    <span className="w-8 h-5 bg-[#252525] rounded flex items-center justify-center overflow-hidden">
                      <svg viewBox="0 0 38 24" className="w-7 h-4"><circle cx="14" cy="12" r="8" fill="#EB001B"/><circle cx="24" cy="12" r="8" fill="#F79E1B"/><path d="M19 6.27A8 8 0 0 1 22.93 12 8 8 0 0 1 19 17.73 8 8 0 0 1 15.07 12 8 8 0 0 1 19 6.27z" fill="#FF5F00"/></svg>
                    </span>
                    <span className="w-8 h-5 bg-[#1A1F71] rounded flex items-center justify-center">
                      <span className="text-[8px] font-black text-white italic">VISA</span>
                    </span>
                  </div>
                </label>

                {paymentMethod === "card" && (
                  <div className="px-4 py-4 space-y-3 bg-[#fdfbf4]">
                    <input type="text" placeholder="Card number" className={inputClass} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Expiration date (MM / YY)" className={inputClass} />
                      <input type="text" placeholder="Security code" className={inputClass} />
                    </div>
                    <input type="text" placeholder="Name on card" className={inputClass} />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-3.5 h-3.5 accent-[#D4AF37]" defaultChecked />
                      <span className="text-xs text-gray-600 font-sans">Use shipping address as billing address</span>
                    </label>
                  </div>
                )}

                {/* Klarna */}
                <label className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-200 ${paymentMethod === "online" ? "bg-[#fdfbf4]" : "bg-white"}`}>
                  <input type="radio" value="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="w-4 h-4 accent-[#D4AF37]" />
                  <span className="text-sm font-sans font-medium flex-1">Klarna</span>
                  <span className="w-12 h-5 bg-[#FFB3C7] rounded flex items-center justify-center text-[8px] font-bold text-black">Klarna</span>
                </label>

                {/* PayPal */}
                <label className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${paymentMethod === "upi" ? "bg-[#fdfbf4]" : "bg-white"}`}>
                  <input type="radio" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} className="w-4 h-4 accent-[#D4AF37]" />
                  <span className="text-sm font-sans font-medium flex-1">PayPal</span>
                  <span className="text-xs font-bold" style={{ color: "#003087" }}>Pay<span style={{ color: "#009CDE" }}>Pal</span></span>
                </label>
              </div>
            </div>

            {/* Remember me */}
            <div className="mb-6 border border-gray-200 rounded-md p-4 bg-gray-50">
              <p className="text-sm font-sans font-medium text-gray-800 mb-1">Save my information for a faster checkout</p>
              <p className="text-xs text-gray-400 font-sans">
                Pay faster on your next visit. <span className="underline cursor-pointer">Terms apply</span>
              </p>
            </div>

            {/* Pay button + Back to Home */}
            <style>{`
              .btn-flip-hero {
                opacity: 1;
                outline: 0;
                color: #fff;
                line-height: 44px;
                position: relative;
                text-align: center;
                letter-spacing: 0.18em;
                display: inline-block;
                text-decoration: none;
                font-family: var(--font-sans), 'Open Sans', sans-serif;
                font-size: 11px;
                text-transform: uppercase;
              }
              .btn-flip-hero:after {
                top: 0;
                left: 0;
                opacity: 0;
                width: 100%;
                color: #1A1A1A;
                display: block;
                transition: 0.45s cubic-bezier(0.23, 1, 0.32, 1);
                position: absolute;
                background: #D4AF37;
                content: attr(data-back);
                transform: translateY(-50%) rotateX(90deg);
                padding: 0 32px;
                border-radius: 999px;
              }
              .btn-flip-hero:before {
                top: 0;
                left: 0;
                opacity: 1;
                color: #D4AF37;
                display: block;
                padding: 0 32px;
                line-height: 44px;
                transition: 0.45s cubic-bezier(0.23, 1, 0.32, 1);
                position: relative;
                background: rgba(212,175,55,0.08);
                border: 1px solid rgba(212,175,55,0.5);
                content: attr(data-front);
                transform: translateY(0) rotateX(0);
                border-radius: 999px;
              }
              .btn-flip-hero:hover:after {
                opacity: 1;
                transform: translateY(0) rotateX(0);
              }
              .btn-flip-hero:hover:before {
                opacity: 0;
                transform: translateY(50%) rotateX(90deg);
              }
              .btn-flip-hero:active {
                transform: scale(0.97);
              }
              .btn-flip-pay {
                opacity: 1;
                outline: 0;
                color: #fff;
                line-height: 52px;
                position: relative;
                text-align: center;
                letter-spacing: 0.18em;
                display: block;
                width: 100%;
                text-decoration: none;
                font-family: var(--font-sans), 'Open Sans', sans-serif;
                font-size: 11px;
                text-transform: uppercase;
                cursor: pointer;
                border: none;
                background: transparent;
              }
              .btn-flip-pay:after {
                top: 0;
                left: 0;
                opacity: 0;
                width: 100%;
                color: #D4AF37;
                display: block;
                transition: 0.45s cubic-bezier(0.23, 1, 0.32, 1);
                position: absolute;
                background: #1A1A1A;
                content: attr(data-back);
                transform: translateY(-50%) rotateX(90deg);
                padding: 0 32px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
              }
              .btn-flip-pay:before {
                top: 0;
                left: 0;
                opacity: 1;
                color: #1A1A1A;
                display: block;
                padding: 0 32px;
                line-height: 52px;
                transition: 0.45s cubic-bezier(0.23, 1, 0.32, 1);
                position: relative;
                background: #D4AF37;
                content: attr(data-front);
                transform: translateY(0) rotateX(0);
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(212,175,55,0.4);
              }
              .btn-flip-pay:hover:after {
                opacity: 1;
                transform: translateY(0) rotateX(0);
              }
              .btn-flip-pay:hover:before {
                opacity: 0;
                transform: translateY(50%) rotateX(90deg);
              }
              .btn-flip-pay:active {
                transform: scale(0.97);
              }
              .btn-flip-pay:disabled {
                opacity: 0.6;
                pointer-events: none;
              }
            `}</style>

            <button
              type="submit"
              disabled={loading}
              className="btn-flip-pay mb-6"
              data-front={loading ? "Processing..." : "🔒  Pay Now"}
              data-back={loading ? "Processing..." : "🔒  Pay Now"}
            />

            {/* Back to home */}
            <div className="flex justify-center mb-4">
              <Link href="/" className="btn-flip-hero" data-front="← Back to Home" data-back="← Back to Home" />
            </div>

            {/* Footer links */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-sans pb-10">
              <Link href="#" className="hover:text-[#D4AF37]">Refund policy</Link>
              <Link href="#" className="hover:text-[#D4AF37]">Privacy policy</Link>
              <Link href="#" className="hover:text-[#D4AF37]">Terms of service</Link>
            </div>
          </div>

          {/* ── RIGHT — Order summary ── */}
          <div className="lg:w-[45%] bg-[#F9F9F9] border-l border-gray-200 px-6 md:px-10 lg:px-12 py-8 lg:sticky lg:top-[57px] lg:self-start lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto">

            {/* Items */}
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative w-14 h-14 flex-shrink-0 bg-white rounded border border-gray-200 overflow-hidden">
                    <ProductImage src={item.image} alt={item.name} fill className="object-contain p-1" sizes="56px" />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-500 text-white text-[9px] flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-sans uppercase tracking-widest">{item.category}</p>
                    <p className="text-sm font-medium text-gray-800 font-sans line-clamp-2">{item.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 font-sans flex-shrink-0">
                    £{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Discount code */}
            <div className="flex gap-2 mb-6">
              <div className="flex-1 relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={discountCode}
                  onChange={e => setDiscountCode(e.target.value)}
                  placeholder="Discount code or gift card"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-white placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                className="px-5 py-2.5 border border-gray-200 rounded-md text-sm font-sans font-medium text-gray-700 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors bg-white"
              >
                Apply
              </button>
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm font-sans text-gray-600">
                <span>Subtotal · {items.reduce((s, i) => s + i.quantity, 0)} items</span>
                <span className="font-medium text-gray-900">£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-sans text-gray-600">
                <span>Shipping</span>
                <span className="text-gray-400 text-xs">Enter shipping address</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-gray-200">
              <span className="text-base font-semibold text-gray-900 font-sans">Total</span>
              <div className="text-right">
                <span className="text-xs text-gray-400 font-sans mr-1">GBP</span>
                <span className="text-2xl font-bold text-gray-900 font-sans">£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
