import { NextRequest, NextResponse } from "next/server";
import SiteTheme, { type ThemeKey } from "./siteThemeModel";
import { AppError, errorResponse } from "@/lib/apiError";

const VALID_THEMES: ThemeKey[] = ["gold", "medical"];

// ─── GET /api/site-theme ──────────────────────────────────────────────────────
export async function getTheme(_req: NextRequest): Promise<NextResponse> {
  try {
    // Get or create singleton row
    const [row] = await SiteTheme.findOrCreate({
      where:    { id: 1 },
      defaults: { activeTheme: "gold" },
    });
    return NextResponse.json({ success: true, data: { activeTheme: row.activeTheme } });
  } catch (err) {
    return errorResponse(err);
  }
}

// ─── PUT /api/site-theme ──────────────────────────────────────────────────────
// Body: { activeTheme: "gold" | "medical" }
export async function updateTheme(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { activeTheme } = body;

    if (!activeTheme || !VALID_THEMES.includes(activeTheme)) {
      throw new AppError(
        `Invalid theme. Must be one of: ${VALID_THEMES.join(", ")}`,
        400,
        "INVALID_THEME",
      );
    }

    const [row] = await SiteTheme.findOrCreate({
      where:    { id: 1 },
      defaults: { activeTheme },
    });

    if (row.activeTheme !== activeTheme) {
      await row.update({ activeTheme, updatedAt: new Date() });
    }

    return NextResponse.json({
      success: true,
      message: `Theme changed to "${activeTheme}".`,
      data:    { activeTheme: row.activeTheme },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
