/* eslint-disable @typescript-eslint/no-require-imports */
import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import Staff, { type StaffAttributes, type StaffRole } from "./staffModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "StaffController";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_ROLES: StaffRole[] = [
  "pharmacist",
  "cashier",
  "store_manager",
  "delivery",
  "inventory_clerk",
  "other",
];

function toNum(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function parsePagination(sp: URLSearchParams) {
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit  = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// ─── GET /api/staff ───────────────────────────────────────────────────────────
// ?isActive, ?role, ?search (fullName / employeeCode / phone), ?page, ?limit

export async function getAllStaff(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getAllStaff — start");

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);

    const isActiveParam = searchParams.get("isActive");
    const role          = searchParams.get("role");
    const search        = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (isActiveParam !== null) where.isActive = isActiveParam === "true";
    if (role)                   where.role      = role;

    if (search) {
      where[Op.or as unknown as string] = [
        { fullName:     { [Op.iLike]: `%${search}%` } },
        { employeeCode: { [Op.iLike]: `%${search}%` } },
        { phone:        { [Op.iLike]: `%${search}%` } },
      ];
    }

    logger.debug(CTX, "getAllStaff — query", { where, page, limit });

    const { count, rows } = await Staff.findAndCountAll({
      where,
      order: [["fullName", "ASC"]],
      limit,
      offset,
    });

    logger.info(CTX, `getAllStaff — ${rows.length} of ${count}`);

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
    logger.error(CTX, "getAllStaff — failed", error);
    return errorResponse(error);
  }
}

// ─── GET /api/staff/:id ───────────────────────────────────────────────────────

export async function getStaffById(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getStaffById — start", { id });

  try {
    if (!id) throw new AppError("Staff ID is required.", 400, "MISSING_ID");

    const staff = await Staff.findByPk(id);
    if (!staff) {
      logger.warn(CTX, "getStaffById — not found", { id });
      throw new AppError("Staff member not found.", 404, "NOT_FOUND");
    }

    logger.info(CTX, "getStaffById — found", { id, name: staff.fullName });
    return NextResponse.json({ success: true, data: staff }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getStaffById — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── POST /api/staff ──────────────────────────────────────────────────────────

export async function createStaff(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createStaff — start");

  try {
    const body = await req.json();
    const {
      fullName, employeeCode, role, phone,
      email, address, dateOfJoining, salary,
      isActive, notes,
    } = body;

    logger.debug(CTX, "createStaff — payload", { fullName, employeeCode, role });

    // ── Required validation ───────────────────────────────────────────────────
    for (const [field, val] of Object.entries({ fullName, employeeCode, phone, dateOfJoining })) {
      if (!String(val ?? "").trim()) {
        throw new AppError(`${field} is required.`, 400, "VALIDATION_ERROR");
      }
    }
    if (role && !VALID_ROLES.includes(role)) {
      throw new AppError(`role must be one of: ${VALID_ROLES.join(", ")}.`, 400, "VALIDATION_ERROR");
    }

    // ── Duplicate employeeCode check ──────────────────────────────────────────
    const existing = await Staff.findOne({
      where: { employeeCode: { [Op.iLike]: employeeCode.trim() } },
    });
    if (existing) {
      logger.warn(CTX, "createStaff — duplicate employeeCode", { employeeCode });
      throw new AppError(
        `Employee code "${employeeCode}" is already in use.`,
        409, "DUPLICATE_CODE",
      );
    }

    const staff = await Staff.create({
      fullName:      fullName.trim(),
      employeeCode:  employeeCode.trim().toUpperCase(),
      role:          role ?? "other",
      phone:         phone.trim(),
      email:         email?.trim() || null,
      address:       address?.trim() || null,
      dateOfJoining: new Date(dateOfJoining),
      salary:        toNum(salary ?? 0),
      isActive:      isActive !== undefined ? Boolean(isActive) : true,
      notes:         notes?.trim() || null,
    });

    logger.info(CTX, "createStaff — created", { id: staff.id, name: staff.fullName });
    return NextResponse.json({ success: true, data: staff }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createStaff — failed", error);
    return errorResponse(error);
  }
}

// ─── PUT /api/staff/:id ───────────────────────────────────────────────────────

export async function updateStaff(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateStaff — start", { id });

  try {
    if (!id) throw new AppError("Staff ID is required.", 400, "MISSING_ID");

    const staff = await Staff.findByPk(id);
    if (!staff) {
      logger.warn(CTX, "updateStaff — not found", { id });
      throw new AppError("Staff member not found.", 404, "NOT_FOUND");
    }

    const body = await req.json();
    const {
      fullName, employeeCode, role, phone,
      email, address, dateOfJoining, salary,
      isActive, notes,
    } = body;

    logger.debug(CTX, "updateStaff — payload", { id, fullName, employeeCode });

    // If changing employeeCode, check no duplicate
    if (employeeCode && employeeCode.trim().toUpperCase() !== staff.employeeCode) {
      const dup = await Staff.findOne({
        where: {
          employeeCode: { [Op.iLike]: employeeCode.trim() },
          id: { [Op.ne]: id },
        },
      });
      if (dup) {
        throw new AppError(
          `Employee code "${employeeCode}" is already in use.`,
          409, "DUPLICATE_CODE",
        );
      }
    }

    if (role && !VALID_ROLES.includes(role)) {
      throw new AppError(`role must be one of: ${VALID_ROLES.join(", ")}.`, 400, "VALIDATION_ERROR");
    }

    const updates: Partial<StaffAttributes> = {
      ...(fullName      != null && { fullName:      fullName.trim() }),
      ...(employeeCode  != null && { employeeCode:  employeeCode.trim().toUpperCase() }),
      ...(role          != null && { role }),
      ...(phone         != null && { phone:         phone.trim() }),
      ...(email         != null && { email:         email.trim() || null }),
      ...(address       != null && { address:       address.trim() || null }),
      ...(dateOfJoining != null && { dateOfJoining: new Date(dateOfJoining) }),
      ...(salary        != null && { salary:        toNum(salary) }),
      ...(isActive      != null && { isActive:      Boolean(isActive) }),
      ...(notes         != null && { notes:         notes.trim() || null }),
    };

    await staff.update(updates);

    logger.info(CTX, "updateStaff — updated", { id, name: staff.fullName });
    return NextResponse.json({ success: true, data: staff }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateStaff — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── PATCH /api/staff/:id/toggle-active ──────────────────────────────────────

export async function toggleStaffActive(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "toggleStaffActive — start", { id });

  try {
    if (!id) throw new AppError("Staff ID is required.", 400, "MISSING_ID");

    const staff = await Staff.findByPk(id);
    if (!staff) {
      logger.warn(CTX, "toggleStaffActive — not found", { id });
      throw new AppError("Staff member not found.", 404, "NOT_FOUND");
    }

    const previous = staff.isActive;
    await staff.update({ isActive: !previous });

    logger.info(CTX, "toggleStaffActive — toggled", {
      id, name: staff.fullName, from: previous, to: staff.isActive,
    });

    return NextResponse.json({
      success: true,
      message: `"${staff.fullName}" is now ${staff.isActive ? "active" : "inactive"}.`,
      data: { id: staff.id, fullName: staff.fullName, isActive: staff.isActive },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "toggleStaffActive — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── POST /api/staff/bulk ─────────────────────────────────────────────────────
// Bulk create from JSON array OR Excel (.xlsx / .xls).
//
// Excel columns (flexible names accepted):
//   fullName      | Full Name | Name
//   employeeCode  | Employee Code | Code
//   role          | Role
//   phone         | Phone
//   email         | Email
//   address       | Address
//   dateOfJoining | Date of Joining | Joining Date
//   salary        | Salary
//   isActive      | Active  (default: true)
//   notes         | Notes

export async function bulkCreateStaff(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "bulkCreateStaff — start");

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let rawRows: Record<string, unknown>[] = [];

    // ── Excel upload ──────────────────────────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      logger.debug(CTX, "bulkCreateStaff — parsing Excel file");

      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) throw new AppError("No file uploaded. Field name must be 'file'.", 400, "NO_FILE");
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        throw new AppError("Only .xlsx or .xls files are accepted.", 400, "INVALID_FILE_TYPE");
      }

      const XLSX     = require("xlsx");
      const wb       = XLSX.read(Buffer.from(await file.arrayBuffer()), { type: "buffer" });
      rawRows        = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

      logger.debug(CTX, `bulkCreateStaff — parsed ${rawRows.length} rows from Excel`);
    }
    // ── JSON body ─────────────────────────────────────────────────────────────
    else {
      const body = await req.json();
      if (!Array.isArray(body)) {
        throw new AppError("Request body must be a JSON array.", 400, "INVALID_BODY");
      }
      rawRows = body;
    }

    if (rawRows.length === 0) throw new AppError("No rows found.", 400, "EMPTY_DATA");

    // ── Normalise rows ────────────────────────────────────────────────────────
    interface NormRow {
      fullName: string;
      employeeCode: string;
      role: string;
      phone: string;
      email: string | null;
      address: string | null;
      dateOfJoining: string;
      salary: number;
      isActive: boolean;
      notes: string | null;
    }

    const normRows: NormRow[] = rawRows.map((r) => ({
      fullName:      String(r.fullName      ?? r["Full Name"]       ?? r["Name"]          ?? "").trim(),
      employeeCode:  String(r.employeeCode  ?? r["Employee Code"]   ?? r["Code"]          ?? "").trim().toUpperCase(),
      role:          String(r.role          ?? r["Role"]            ?? "other").trim().toLowerCase(),
      phone:         String(r.phone         ?? r["Phone"]           ?? "").trim(),
      email:         String(r.email         ?? r["Email"]           ?? "").trim() || null,
      address:       String(r.address       ?? r["Address"]         ?? "").trim() || null,
      dateOfJoining: String(r.dateOfJoining ?? r["Date of Joining"] ?? r["Joining Date"] ?? "").trim(),
      salary:        toNum(r.salary         ?? r["Salary"]          ?? 0),
      isActive:      String(r.isActive      ?? r["Active"]          ?? "true").toLowerCase() !== "false",
      notes:         String(r.notes         ?? r["Notes"]           ?? "").trim() || null,
    }));

    // ── Validate each row ─────────────────────────────────────────────────────
    interface RowError { row: number; reason: string }

    const toCreate: NormRow[] = [];
    const errors: RowError[]  = [];

    for (let i = 0; i < normRows.length; i++) {
      const r      = normRows[i];
      const rowNum = i + 2; // +2 because row 1 is the header

      if (!r.fullName)      { errors.push({ row: rowNum, reason: "Missing fullName" });      continue; }
      if (!r.employeeCode)  { errors.push({ row: rowNum, reason: "Missing employeeCode" });  continue; }
      if (!r.phone)         { errors.push({ row: rowNum, reason: "Missing phone" });          continue; }
      if (!r.dateOfJoining) { errors.push({ row: rowNum, reason: "Missing dateOfJoining" }); continue; }

      if (!VALID_ROLES.includes(r.role as StaffRole)) {
        // Fall back to "other" silently rather than failing the row
        r.role = "other";
      }

      toCreate.push(r);
    }

    logger.info(CTX, `bulkCreateStaff — ${toCreate.length} valid, ${errors.length} invalid`);

    // ── Duplicate employeeCode check against DB ────────────────────────────────
    const incomingCodes   = toCreate.map((r) => r.employeeCode);
    const existingStaff   = await Staff.findAll({
      where: { employeeCode: { [Op.in]: incomingCodes } },
      attributes: ["employeeCode"],
    });
    const existingCodes   = new Set(existingStaff.map((s) => s.employeeCode));

    const finalCreate: NormRow[] = [];
    const skipped: string[]      = [];

    for (const row of toCreate) {
      if (existingCodes.has(row.employeeCode)) {
        skipped.push(row.employeeCode);
      } else {
        finalCreate.push(row);
      }
    }

    logger.debug(CTX, `bulkCreateStaff — ${skipped.length} duplicate codes skipped`);

    // ── Bulk insert ────────────────────────────────────────────────────────────
    const created = await Staff.bulkCreate(
      finalCreate.map((r) => ({
        fullName:      r.fullName,
        employeeCode:  r.employeeCode,
        role:          r.role as StaffRole,
        phone:         r.phone,
        email:         r.email,
        address:       r.address,
        dateOfJoining: new Date(r.dateOfJoining),
        salary:        r.salary,
        isActive:      r.isActive,
        notes:         r.notes,
      })),
      { validate: true },
    );

    logger.info(CTX, "bulkCreateStaff — done", {
      total: rawRows.length, created: created.length,
      skipped: skipped.length, failed: errors.length,
    });

    return NextResponse.json({
      success: true,
      summary: {
        total:   rawRows.length,
        created: created.length,
        skipped: skipped.length,
        failed:  errors.length,
      },
      skippedCodes: skipped,
      errors,
      data: created,
    }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "bulkCreateStaff — failed", error);
    return errorResponse(error);
  }
}
