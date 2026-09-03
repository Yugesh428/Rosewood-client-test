import { NextRequest, NextResponse } from "next/server";
import SiteTheme, { CustomTheme } from "./siteThemeModel";
import { AppError, errorResponse } from "@/lib/apiError";

// ─── GET /api/site-theme ──────────────────────────────────────────────────────
// Returns the currently active theme (full theme object)
export async function getTheme(_req: NextRequest): Promise<NextResponse> {
  try {
    // Get singleton row
    const [row] = await SiteTheme.findOrCreate({
      where:    { id: 1 },
      defaults: { activeThemeId: "gold" },
    });

    console.log("[getTheme] Active theme ID from database:", row.activeThemeId);

    let activeTheme;
    
    // Always try to fetch from database first (includes both default and custom themes)
    const themeFromDb = await CustomTheme.findByPk(row.activeThemeId);
    
    if (themeFromDb) {
      activeTheme = themeFromDb.toJSON();
      console.log("[getTheme] Found theme in database:", activeTheme.name);
    } else {
      // Fallback to hardcoded defaults if not in database
      console.log("[getTheme] Theme not in database, using fallback");
      const defaultThemes = {
        gold: {
          id: "gold",
          name: "Gold & Black",
          isDefault: true,
          primary: "#D4AF37",
          primaryLight: "#ffe87c",
          primaryDark: "#b8952e",
          primaryText: "#000000",
          bgPage: "#F9F9F9",
          bgCard: "#ffffff",
          bgNav: "#000000",
          textHeading: "#1A1A1A",
          textBody: "#374151",
          textMuted: "#6B6B6B",
          borderColor: "#E8E4DC",
          shadow: "0 2px 12px rgba(0,0,0,0.08)",
          shadowHover: "0 8px 28px rgba(0,0,0,0.15)",
        },
        medical: {
          id: "medical",
          name: "Medical Blue",
          isDefault: true,
          primary: "#00B4D8",
          primaryLight: "#90E0EF",
          primaryDark: "#0096C7",
          primaryText: "#ffffff",
          bgPage: "#EAF6FB",
          bgCard: "#ffffff",
          bgNav: "#023E8A",
          textHeading: "#023E8A",
          textBody: "#1a4a6b",
          textMuted: "#4a7a96",
          borderColor: "#CAE9F5",
          shadow: "0 2px 12px rgba(0,100,160,0.10)",
          shadowHover: "0 8px 28px rgba(0,100,160,0.20)",
        },
      };
      
      if (row.activeThemeId === "gold" || row.activeThemeId === "medical") {
        activeTheme = defaultThemes[row.activeThemeId as "gold" | "medical"];
      } else {
        // Theme not found, fallback to gold
        console.warn("[getTheme] Unknown theme ID, falling back to gold");
        await row.update({ activeThemeId: "gold" });
        activeTheme = defaultThemes.gold;
      }
    }

    return NextResponse.json({ success: true, data: { activeTheme } });
  } catch (err) {
    console.error("[getTheme] Error:", err);
    return errorResponse(err);
  }
}

// ─── PUT /api/site-theme ──────────────────────────────────────────────────────
// Body: { activeThemeId: "gold" | "medical" | UUID }
export async function updateTheme(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { activeThemeId } = body;

    if (!activeThemeId) {
      throw new AppError("activeThemeId is required", 400, "VALIDATION_ERROR");
    }

    console.log("[updateTheme] Attempting to set theme to:", activeThemeId);

    // Validate: check if theme exists
    // First check if it's in custom_themes table (includes both default and custom themes)
    const themeExists = await CustomTheme.findByPk(activeThemeId);
    
    if (!themeExists) {
      console.error("[updateTheme] Theme not found in database:", activeThemeId);
      throw new AppError("Theme not found", 404, "NOT_FOUND");
    }

    console.log("[updateTheme] Theme found:", themeExists.name);

    const [row] = await SiteTheme.findOrCreate({
      where:    { id: 1 },
      defaults: { activeThemeId },
    });

    if (row.activeThemeId !== activeThemeId) {
      await row.update({ activeThemeId, updatedAt: new Date() });
      console.log("[updateTheme] Theme updated successfully to:", activeThemeId);
    } else {
      console.log("[updateTheme] Theme already active:", activeThemeId);
    }

    return NextResponse.json({
      success: true,
      message: "Theme changed successfully",
      data:    { activeThemeId: row.activeThemeId },
    });
  } catch (err) {
    console.error("[updateTheme] Error:", err);
    return errorResponse(err);
  }
}
