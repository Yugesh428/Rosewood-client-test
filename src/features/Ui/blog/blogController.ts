import { NextRequest, NextResponse } from "next/server";
import Blog from "./blogModel";
import { storage } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";
import { Op } from "sequelize";

const CTX = "BlogController";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// ─── Helper: validate + save cover image ─────────────────────────────────────
async function saveCoverImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new AppError(
      `Invalid file type "${file.type}". Allowed: ${ALLOWED_TYPES.join(", ")}.`,
      400,
      "INVALID_FILE_TYPE",
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new AppError("Cover image must not exceed 10 MB.", 400, "FILE_TOO_LARGE");
  }
  const result = await storage.save(file, "blog");
  return result.url;
}

// ─── Helper: generate slug from title ────────────────────────────────────────
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with single dash
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
}

// ─── GET /api/ui/blog ─────────────────────────────────────────────────────────
// Public: published only | Admin: ?all=true
export async function getBlogs(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getBlogs — start");

  try {
    const url = new URL(req.url);
    const showAll = url.searchParams.get("all") === "true";
    const category = url.searchParams.get("category");
    const featured = url.searchParams.get("featured") === "true";

    const where: Record<string, unknown> = showAll ? {} : { isPublished: true };
    if (category) where.category = category;
    if (featured) where.isFeatured = true;

    const blogs = await Blog.findAll({
      where,
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    logger.info(CTX, `getBlogs — ${blogs.length} items`);
    return NextResponse.json({ success: true, data: blogs }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getBlogs — failed", error);
    return errorResponse(error);
  }
}

// ─── GET /api/ui/blog/:id ─────────────────────────────────────────────────────
export async function getBlog(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "getBlog — start", { id });

  try {
    if (!id) throw new AppError("Blog ID is required.", 400, "MISSING_ID");

    const blog = await Blog.findByPk(id);
    if (!blog) {
      logger.warn(CTX, "getBlog — not found", { id });
      throw new AppError("Blog not found.", 404, "NOT_FOUND");
    }

    return NextResponse.json({ success: true, data: blog }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getBlog — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── GET /api/ui/blog/slug/:slug ──────────────────────────────────────────────
export async function getBlogBySlug(
  _req: NextRequest,
  slug: string,
): Promise<NextResponse> {
  logger.info(CTX, "getBlogBySlug — start", { slug });

  try {
    if (!slug) throw new AppError("Blog slug is required.", 400, "MISSING_SLUG");

    const blog = await Blog.findOne({ where: { slug } });
    if (!blog) {
      logger.warn(CTX, "getBlogBySlug — not found", { slug });
      throw new AppError("Blog not found.", 404, "NOT_FOUND");
    }

    return NextResponse.json({ success: true, data: blog }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getBlogBySlug — failed", { slug, error });
    return errorResponse(error);
  }
}

// ─── POST /api/ui/blog ────────────────────────────────────────────────────────
// Admin: create a blog post
export async function createBlog(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createBlog — start");

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let fields: Record<string, string> = {};
    let coverImage: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      for (const [key, value] of formData.entries()) {
        if (typeof value === "string" && key !== "coverImage") fields[key] = value;
      }

      const file = formData.get("coverImage") as File | null;
      if (file?.size) {
        coverImage = await saveCoverImage(file);
        logger.debug(CTX, "createBlog — cover image saved", { coverImage });
      } else if (fields.coverImageUrl) {
        coverImage = fields.coverImageUrl;
      }
    } else {
      const body = await req.json() as Record<string, string>;
      fields = body;
      coverImage = body.coverImage ?? body.coverImageUrl ?? null;
    }

    const { title, slug, category, excerpt, content, authorName, authorRole, date, isPublished, isFeatured, displayOrder } = fields;

    if (!title?.trim())
      throw new AppError("title is required.", 400, "MISSING_TITLE");
    if (!coverImage)
      throw new AppError("coverImage (file or URL) is required.", 400, "MISSING_COVER_IMAGE");
    if (!excerpt?.trim())
      throw new AppError("excerpt is required.", 400, "MISSING_EXCERPT");
    if (!content?.trim())
      throw new AppError("content is required.", 400, "MISSING_CONTENT");
    if (!date?.trim())
      throw new AppError("date is required.", 400, "MISSING_DATE");

    // Generate slug if not provided
    const finalSlug = slug?.trim() || generateSlug(title);

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ where: { slug: finalSlug } });
    if (existingBlog) {
      throw new AppError(`A blog with slug "${finalSlug}" already exists.`, 400, "DUPLICATE_SLUG");
    }

    const blog = await Blog.create({
      title: title.trim(),
      slug: finalSlug,
      category: category?.trim() || "Skin Care",
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage,
      authorName: authorName?.trim() || "Prakriti Team",
      authorRole: authorRole?.trim() || "Author",
      date: date.trim(),
      isPublished: isPublished !== undefined ? isPublished !== "false" : false,
      isFeatured: isFeatured !== undefined ? isFeatured !== "false" : false,
      displayOrder: displayOrder ? Number(displayOrder) : 0,
    });

    logger.info(CTX, "createBlog — created", { id: blog.id });
    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createBlog — failed", error);
    return errorResponse(error);
  }
}

// ─── PUT /api/ui/blog/:id ─────────────────────────────────────────────────────
// Admin: update blog post
export async function updateBlog(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateBlog — start", { id });

  try {
    if (!id) throw new AppError("Blog ID is required.", 400, "MISSING_ID");

    const blog = await Blog.findByPk(id);
    if (!blog) {
      logger.warn(CTX, "updateBlog — not found", { id });
      throw new AppError("Blog not found.", 404, "NOT_FOUND");
    }

    const contentType = req.headers.get("content-type") ?? "";
    let fields: Record<string, string> = {};
    let newCoverImage: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      for (const [key, value] of formData.entries()) {
        if (typeof value === "string" && key !== "coverImage") fields[key] = value;
      }

      const file = formData.get("coverImage") as File | null;
      if (file?.size) {
        // Delete old local image before replacing
        if (blog.coverImage && storage.isLocalUpload(blog.coverImage)) {
          await storage.delete(blog.coverImage);
        }
        newCoverImage = await saveCoverImage(file);
        logger.debug(CTX, "updateBlog — cover image replaced", { newCoverImage });
      } else if (fields.coverImageUrl !== undefined) {
        newCoverImage = fields.coverImageUrl || undefined;
      }
    } else {
      fields = await req.json() as Record<string, string>;
      if (fields.coverImage !== undefined) newCoverImage = fields.coverImage || undefined;
      if (fields.coverImageUrl !== undefined) newCoverImage = fields.coverImageUrl || undefined;
    }

    // Check slug uniqueness if updating slug
    if (fields.slug && fields.slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ where: { slug: fields.slug, id: { [Op.ne]: id } } });
      if (existingBlog) {
        throw new AppError(`A blog with slug "${fields.slug}" already exists.`, 400, "DUPLICATE_SLUG");
      }
    }

    await blog.update({
      ...(fields.title !== undefined && { title: fields.title.trim() }),
      ...(fields.slug !== undefined && { slug: fields.slug.trim() }),
      ...(fields.category !== undefined && { category: fields.category.trim() }),
      ...(fields.excerpt !== undefined && { excerpt: fields.excerpt.trim() }),
      ...(fields.content !== undefined && { content: fields.content.trim() }),
      ...(newCoverImage !== undefined && { coverImage: newCoverImage }),
      ...(fields.authorName !== undefined && { authorName: fields.authorName.trim() }),
      ...(fields.authorRole !== undefined && { authorRole: fields.authorRole.trim() }),
      ...(fields.date !== undefined && { date: fields.date.trim() }),
      ...(fields.isPublished !== undefined && { isPublished: fields.isPublished !== "false" }),
      ...(fields.isFeatured !== undefined && { isFeatured: fields.isFeatured !== "false" }),
      ...(fields.displayOrder !== undefined && { displayOrder: Number(fields.displayOrder) }),
    });

    logger.info(CTX, "updateBlog — updated", { id });
    return NextResponse.json({ success: true, data: blog }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateBlog — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── PATCH /api/ui/blog/:id/toggle ────────────────────────────────────────────
export async function toggleBlogPublish(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "toggleBlogPublish — start", { id });

  try {
    if (!id) throw new AppError("Blog ID is required.", 400, "MISSING_ID");

    const blog = await Blog.findByPk(id);
    if (!blog) throw new AppError("Blog not found.", 404, "NOT_FOUND");

    await blog.update({ isPublished: !blog.isPublished });

    logger.info(CTX, "toggleBlogPublish — toggled", { id, isPublished: blog.isPublished });

    return NextResponse.json(
      {
        success: true,
        message: `Blog is now ${blog.isPublished ? "published" : "unpublished"}.`,
        data: { id: blog.id, isPublished: blog.isPublished },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "toggleBlogPublish — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── DELETE /api/ui/blog/:id ──────────────────────────────────────────────────
export async function deleteBlog(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteBlog — start", { id });

  try {
    if (!id) throw new AppError("Blog ID is required.", 400, "MISSING_ID");

    const blog = await Blog.findByPk(id);
    if (!blog) {
      logger.warn(CTX, "deleteBlog — not found", { id });
      throw new AppError("Blog not found.", 404, "NOT_FOUND");
    }

    // Delete cover image from local storage if applicable
    if (blog.coverImage && storage.isLocalUpload(blog.coverImage)) {
      await storage.delete(blog.coverImage);
      logger.debug(CTX, "deleteBlog — cover image deleted", { coverImage: blog.coverImage });
    }

    await blog.destroy();

    logger.info(CTX, "deleteBlog — deleted", { id });
    return NextResponse.json(
      { success: true, message: "Blog deleted." },
      { status: 200 },
    );
  } catch (error) {
    logger.error(CTX, "deleteBlog — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── PATCH /api/ui/blog/reorder ───────────────────────────────────────────────
// Body: [{ id, displayOrder }, ...]
export async function reorderBlogs(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "reorderBlogs — start");

  try {
    const body = await req.json() as { id: string; displayOrder: number }[];

    if (!Array.isArray(body) || body.length === 0) {
      throw new AppError(
        "Body must be a non-empty array of { id, displayOrder }.",
        400,
        "INVALID_BODY",
      );
    }

    await Promise.all(
      body.map(({ id, displayOrder }) =>
        Blog.update({ displayOrder }, { where: { id } }),
      ),
    );

    logger.info(CTX, "reorderBlogs — done", { count: body.length });

    const updated = await Blog.findAll({
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "reorderBlogs — failed", error);
    return errorResponse(error);
  }
}
