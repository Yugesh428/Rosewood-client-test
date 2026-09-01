/* eslint-disable @typescript-eslint/no-require-imports */
import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import Category from "./productCatetgoryModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "ProductCategoryController";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryRow {
  categoryName: string;
  categoryDescription?: string;
  isActive?: boolean;
}

// ─── GET /api/product-categories ──────────────────────────────────────────────
// Query params: ?isActive, ?parentId, ?search, ?page, ?limit

export async function getAllCategories(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getAllCategories — start");

  try {
    const { searchParams } = new URL(req.url);

    const isActiveParam = searchParams.get("isActive");
    const parentId      = searchParams.get("parentId");   // filter by parent (top-level = "null")
    const search        = searchParams.get("search");
    const page          = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit         = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const offset        = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (isActiveParam !== null) where.isActive = isActiveParam === "true";
    if (parentId === "null")    where.parentId  = null;
    else if (parentId)          where.parentId  = parentId;
    if (search) where.categoryName = { [Op.iLike]: `%${search}%` };

    logger.debug(CTX, "getAllCategories — query", { where, page, limit });

    const { count, rows } = await Category.findAndCountAll({
      where,
      include: [
        { model: Category, as: "subCategories",   attributes: ["id", "categoryName", "isActive"] },
        { model: Category, as: "parentCategory",  attributes: ["id", "categoryName"] },
      ],
      order: [["categoryName", "ASC"]],
      limit,
      offset,
      distinct: true, // needed for correct count with includes
    });

    logger.info(CTX, `getAllCategories — ${rows.length} of ${count}`);

    return NextResponse.json({
      success: true,
      pagination: {
        total:   count,
        page,
        limit,
        pages:   Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
      data: rows,
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getAllCategories — failed", error);
    return errorResponse(error);
  }
}

// ─── GET /api/product-categories/:id ─────────────────────────────────────────

export async function getCategoryById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getCategoryById — start", { id });

  try {
    if (!id) throw new AppError("Category ID is required.", 400, "MISSING_ID");

    const category = await Category.findByPk(id, {
      include: [
        { model: Category, as: "subCategories",  attributes: ["id", "categoryName", "isActive"] },
        { model: Category, as: "parentCategory", attributes: ["id", "categoryName"] },
      ],
    });
    if (!category) {
      logger.warn(CTX, "getCategoryById — not found", { id });
      throw new AppError("Category not found.", 404, "NOT_FOUND");
    }
    return NextResponse.json({ success: true, data: category }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getCategoryById — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── POST /api/product-categories ────────────────────────────────────────────
// Create a single category.

export async function createCategory(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createCategory — start");

  try {
    const body = await req.json();
    const { categoryName, categoryDescription, isActive } = body;

    logger.debug(CTX, "createCategory — payload", { categoryName, isActive });

    if (!categoryName?.trim()) {
      throw new AppError("categoryName is required.", 400, "VALIDATION_ERROR");
    }

    // Check duplicate name
    const existing = await Category.findOne({
      where: { categoryName: { [Op.iLike]: categoryName.trim() } },
    });
    if (existing) {
      logger.warn(CTX, "createCategory — duplicate name", { categoryName });
      throw new AppError(
        `Category "${categoryName}" already exists.`,
        409,
        "DUPLICATE",
      );
    }

    const category = await Category.create({
      categoryName: categoryName.trim(),
      categoryDescription: categoryDescription?.trim() ?? "",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    logger.info(CTX, "createCategory — created", { id: category.id, name: category.categoryName });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createCategory — failed", error);
    return errorResponse(error);
  }
}

// ─── PUT /api/product-categories/:id ─────────────────────────────────────────
// Update categoryName, categoryDescription, isActive (active/inactive toggle).

export async function updateCategory(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateCategory — start", { id });

  try {
    if (!id) throw new AppError("Category ID is required.", 400, "MISSING_ID");

    const body = await req.json();
    const { categoryName, categoryDescription, isActive } = body;

    logger.debug(CTX, "updateCategory — payload", { id, categoryName, isActive });

    const category = await Category.findByPk(id);
    if (!category) {
      logger.warn(CTX, "updateCategory — not found", { id });
      throw new AppError("Category not found.", 404, "NOT_FOUND");
    }

    // If renaming, check for duplicate (excluding self)
    if (categoryName && categoryName.trim() !== category.categoryName) {
      const duplicate = await Category.findOne({
        where: {
          categoryName: { [Op.iLike]: categoryName.trim() },
          id: { [Op.ne]: id },
        },
      });
      if (duplicate) {
        logger.warn(CTX, "updateCategory — duplicate name on rename", { categoryName });
        throw new AppError(
          `Category "${categoryName}" already exists.`,
          409,
          "DUPLICATE",
        );
      }
    }

    await category.update({
      ...(categoryName !== undefined && { categoryName: categoryName.trim() }),
      ...(categoryDescription !== undefined && { categoryDescription: categoryDescription.trim() }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
    });

    logger.info(CTX, "updateCategory — updated", { id, name: category.categoryName });
    return NextResponse.json({ success: true, data: category }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateCategory — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── POST /api/product-categories/bulk ───────────────────────────────────────
// Bulk create from JSON array OR Excel file upload.
// Skips duplicates (by categoryName) and reports results.

export async function bulkCreateCategories(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "bulkCreateCategories — start");

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let rows: CategoryRow[] = [];

    // ── Excel upload ──────────────────────────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      logger.debug(CTX, "bulkCreateCategories — parsing Excel file");

      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) throw new AppError("No file uploaded. Field name must be 'file'.", 400, "NO_FILE");

      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
        throw new AppError("Only .xlsx or .xls files are accepted.", 400, "INVALID_FILE_TYPE");
      }

      const arrayBuffer = await file.arrayBuffer();
      const XLSX = require("xlsx");
      const workbook = XLSX.read(Buffer.from(arrayBuffer), { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

      logger.debug(CTX, `bulkCreateCategories — parsed ${rawRows.length} rows from Excel`);

      rows = rawRows.map((r) => ({
        categoryName: String(r["categoryName"] ?? r["Category Name"] ?? r["name"] ?? "").trim(),
        categoryDescription: String(r["categoryDescription"] ?? r["Description"] ?? r["description"] ?? "").trim(),
        isActive: r["isActive"] !== undefined
          ? String(r["isActive"]).toLowerCase() !== "false"
          : true,
      }));
    }
    // ── JSON body ─────────────────────────────────────────────────────────────
    else {
      logger.debug(CTX, "bulkCreateCategories — parsing JSON body");
      const body = await req.json();

      if (!Array.isArray(body)) {
        throw new AppError("Request body must be a JSON array of category objects.", 400, "INVALID_BODY");
      }
      rows = body as CategoryRow[];
    }

    // ── Validate rows ─────────────────────────────────────────────────────────
    const validRows = rows.filter((r) => r.categoryName?.trim());
    const invalidCount = rows.length - validRows.length;

    if (validRows.length === 0) {
      throw new AppError("No valid rows found. Each row must have a categoryName.", 400, "NO_VALID_ROWS");
    }

    logger.info(CTX, `bulkCreateCategories — ${validRows.length} valid rows, ${invalidCount} skipped (no name)`);

    // ── Fetch existing names for duplicate check ───────────────────────────────
    const incomingNames = validRows.map((r) => r.categoryName.trim().toLowerCase());
    const existingCategories = await Category.findAll({
      where: {
        categoryName: {
          [Op.in]: incomingNames.map((n) =>
            n.charAt(0).toUpperCase() + n.slice(1),
          ),
        },
      },
    });
    const existingNames = new Set(
      existingCategories.map((c) => c.categoryName.toLowerCase()),
    );

    logger.debug(CTX, `bulkCreateCategories — ${existingNames.size} duplicates found in DB`);

    const toCreate: CategoryRow[] = [];
    const skipped: string[] = [];

    for (const row of validRows) {
      if (existingNames.has(row.categoryName.trim().toLowerCase())) {
        skipped.push(row.categoryName);
      } else {
        toCreate.push(row);
      }
    }

    // ── Bulk insert ────────────────────────────────────────────────────────────
    const created = await Category.bulkCreate(
      toCreate.map((r) => ({
        categoryName: r.categoryName.trim(),
        categoryDescription: r.categoryDescription?.trim() ?? "",
        isActive: r.isActive !== undefined ? Boolean(r.isActive) : true,
      })),
      { validate: true },
    );

    logger.info(CTX, "bulkCreateCategories — complete", {
      created: created.length,
      skipped: skipped.length,
      invalidRows: invalidCount,
    });

    return NextResponse.json(
      {
        success: true,
        summary: {
          total: rows.length,
          created: created.length,
          skipped: skipped.length,
          invalidRows: invalidCount,
        },
        skippedNames: skipped,
        data: created,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error(CTX, "bulkCreateCategories — failed", error);
    return errorResponse(error);
  }
}

// ─── PATCH /api/product-categories/:id/toggle-active ─────────────────────────
// Flips isActive: true → false or false → true

export async function toggleCategoryActive(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "toggleCategoryActive — start", { id });

  try {
    if (!id) throw new AppError("Category ID is required.", 400, "MISSING_ID");

    const category = await Category.findByPk(id);
    if (!category) {
      logger.warn(CTX, "toggleCategoryActive — not found", { id });
      throw new AppError("Category not found.", 404, "NOT_FOUND");
    }

    const previous = category.isActive;
    await category.update({ isActive: !previous });

    logger.info(CTX, "toggleCategoryActive — toggled", {
      id,
      name: category.categoryName,
      from: previous,
      to: category.isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Category "${category.categoryName}" is now ${category.isActive ? "active" : "inactive"}.`,
        data: category,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "toggleCategoryActive — failed", { id, error });
    return errorResponse(error);
  }
}
