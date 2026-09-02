"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { themes, type ThemeKey } from "@/lib/theme";
import { toast } from "sonner";
import { Palette, Check } from "lucide-react";

export default function ThemeSettingsPage() {
  const { themeKey, setTheme, loading } = useTheme();
  const [saving, setSaving] = useState(false);

  async function handleSelect(key: ThemeKey) {
    if (key === themeKey || saving) return;
    setSaving(true);
    try {
      await setTheme(key);
      toast.success(`Theme changed to "${themes[key].label}"`);
    } catch {
      toast.error("Failed to save theme.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 bg-[#F8F8F8] min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-sm"
            style={{ background: "linear-gradient(135deg, #1c1c1c, #141414)" }}>
            <Palette className="w-4 h-4" style={{ color: "#D4AF37" }} />
          </div>
          <h1 className="text-2xl font-heading text-gray-900">Theme Settings</h1>
        </div>
        <p className="text-sm text-gray-500 font-sans ml-11">
          Choose the colour theme displayed to all visitors on the public site.
          Changes take effect immediately — no restart needed.
        </p>
      </div>

      {/* Theme Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#D4AF37", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
          {(Object.keys(themes) as ThemeKey[]).map(key => {
            const t       = themes[key];
            const active  = themeKey === key;
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                disabled={saving}
                className="text-left rounded-sm border-2 overflow-hidden transition-all duration-200 hover:shadow-lg disabled:opacity-60"
                style={{
                  borderColor: active ? t.primary : "#E5E5E5",
                  boxShadow:   active ? `0 0 0 3px ${t.primary}33` : undefined,
                }}
              >
                {/* Colour preview strip */}
                <div className="h-20 relative flex items-center justify-center gap-3 px-6"
                  style={{ background: t.bgNav }}>
                  {/* Primary swatch */}
                  <div className="w-10 h-10 rounded-full border-2 border-white/30 shadow-lg"
                    style={{ background: t.primary }} />
                  {/* Light swatch */}
                  <div className="w-6 h-6 rounded-full border-2 border-white/20"
                    style={{ background: t.primaryLight }} />
                  {/* Page bg swatch */}
                  <div className="w-6 h-6 rounded-full border-2 border-white/20"
                    style={{ background: t.bgPage }} />

                  {/* Active checkmark */}
                  {active && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: t.primary }}>
                      <Check className="w-3.5 h-3.5" style={{ color: t.primaryText }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 font-sans">{t.label}</p>
                      <p className="text-xs text-gray-400 font-sans mt-0.5">
                        Primary: <span className="font-mono">{t.primary}</span>
                      </p>
                    </div>
                    {active && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                        style={{ background: t.primary }}>
                        Active
                      </span>
                    )}
                  </div>

                  {/* Sample button preview */}
                  <div className="mt-3 flex gap-2">
                    <div className="h-7 px-3 rounded-sm flex items-center text-[11px] font-bold"
                      style={{ background: t.primary, color: t.primaryText }}>
                      Button
                    </div>
                    <div className="h-7 px-3 rounded-sm flex items-center text-[11px] font-semibold border"
                      style={{ borderColor: t.borderColor, color: t.textBody }}>
                      Outline
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Note */}
      <p className="mt-8 text-xs text-gray-400 font-sans max-w-md">
        The theme is stored in the database and applied globally. All logged-in visitors
        will see the new theme immediately on their next page load.
      </p>
    </div>
  );
}
