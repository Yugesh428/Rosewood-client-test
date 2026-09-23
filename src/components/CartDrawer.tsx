"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface SuggestedProduct {
  id: string;
  productName: string;
  productImage: string | null;
  sellingPrice: number;
  category?: { categoryName: string };
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalItems, totalPrice, updateQty, removeFromCart, clearCart, addToCart } = useCart();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<SuggestedProduct[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/products?isActive=true&limit=10")
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          const cartIds = new Set(items.map(i => i.id));
          const pool = json.data.filter((p: SuggestedProduct) => !cartIds.has(p.id));
          const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 4);
          setSuggestions(shuffled);
        }
      })
      .catch(() => {});
  }, [open, items]);

  function handleCheckout() {
    onClose();
    router.push("/checkout");
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 bg-black/50 backdrop-blur-sm"
          style={{ top: "94px" }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 w-full max-w-sm z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: "94px", height: "calc(100vh - 94px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-gray-700" />
            <h2 className="font-heading text-lg text-gray-900">
              Cart
              {totalItems > 0 && (
                <span className="ml-2 text-sm font-sans text-gray-500">
                  ({totalItems} item{totalItems !== 1 ? "s" : ""})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-400 font-sans text-sm">Your cart is empty</p>
              <p className="text-gray-300 font-sans text-xs mt-1">Add some products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-sm border border-gray-100">
                  <div className="w-16 h-16 bg-white rounded-sm flex-shrink-0 overflow-hidden border border-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 font-sans">{item.category}</p>
                    <p className="text-sm text-gray-900 font-medium leading-snug line-clamp-2 font-sans mt-0.5">
                      {item.name}
                    </p>
                    <p className="text-sm font-heading text-gray-900 mt-1">
                      £{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── You May Also Like ── */}
          {suggestions.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-sans mb-3">
                You may also like
              </p>
              <div className="grid grid-cols-2 gap-3">
                {suggestions.map(product => (
                  <div
                    key={product.id}
                    className="bg-gray-50 border border-gray-100 rounded-sm overflow-hidden group cursor-pointer"
                    onClick={() => { onClose(); router.push(`/pharmacy/${product.id}`); }}
                  >
                    <div className="relative aspect-square bg-white overflow-hidden">
                      {product.productImage ? (
                        <Image
                          src={product.productImage}
                          alt={product.productName}
                          fill
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          unoptimized={product.productImage.startsWith("http")}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200 text-xs">No img</div>
                      )}
                    </div>
                    <div className="p-2 text-center">
                      {product.category?.categoryName && (
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-sans mb-0.5">
                          {product.category.categoryName}
                        </p>
                      )}
                      <p className="text-xs text-gray-800 font-medium line-clamp-2 font-sans leading-snug mb-1">
                        {product.productName}
                      </p>
                      <p className="text-xs font-semibold text-gray-900 font-sans mb-2">
                        £{Number(product.sellingPrice).toFixed(2)}
                      </p>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          addToCart({
                            id: product.id,
                            name: product.productName,
                            price: Number(product.sellingPrice),
                            image: product.productImage ?? "",
                            category: product.category?.categoryName ?? "",
                          });
                          toast.success("Added to cart");
                        }}
                        className="w-full py-1.5 text-[9px] uppercase tracking-widest font-sans font-medium transition-all rounded-sm"
                        style={{ border: "1px solid #D4AF37", color: "#D4AF37", background: "transparent" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#D4AF37"; }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-sans">Subtotal</span>
              <span className="font-heading text-lg text-gray-900">£{totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-sm text-black text-sm font-semibold tracking-wide transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #ffe87c 50%, #b8952e 100%)",
                boxShadow: "0 4px 14px rgba(212,175,55,0.4)",
              }}
            >
              Checkout — £{totalPrice.toFixed(2)}
            </button>
            <button
              onClick={clearCart}
              className="w-full py-2 text-xs text-gray-400 hover:text-red-400 transition-colors font-sans"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
