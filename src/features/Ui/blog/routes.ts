/**
 * Blog Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/ui/blog
 *
 * ┌─────────────────────────────────────────────────────┬──────────────────────┐
 * │ Endpoint                                            │ Handler              │
 * ├─────────────────────────────────────────────────────┼──────────────────────┤
 * │ GET    /api/ui/blog                                 │ getBlogs             │
 * │        ?all=true (optional: include unpublished)    │                      │
 * │        ?category=GIFTING (optional: filter)         │                      │
 * │        ?featured=true (optional: featured only)     │                      │
 * ├─────────────────────────────────────────────────────┼──────────────────────┤
 * │ GET    /api/ui/blog/:id                             │ getBlog              │
 * ├─────────────────────────────────────────────────────┼──────────────────────┤
 * │ GET    /api/ui/blog/slug/:slug                      │ getBlogBySlug        │
 * ├─────────────────────────────────────────────────────┼──────────────────────┤
 * │ POST   /api/ui/blog                                 │ createBlog           │
 * │        multipart/form-data OR JSON:                 │                      │
 * │          coverImage (file) | coverImageUrl (req),   │                      │
 * │          title (required),                          │                      │
 * │          slug (optional, auto-generated),           │                      │
 * │          category (default: "Skin Care"),           │                      │
 * │          excerpt (required),                        │                      │
 * │          content (required, HTML),                  │                      │
 * │          authorName (default: "Prakriti Team"),     │                      │
 * │          authorRole (default: "Author"),            │                      │
 * │          date (required, e.g., "12 January 2026"),  │                      │
 * │          isPublished?, isFeatured?, displayOrder?   │                      │
 * ├─────────────────────────────────────────────────────┼──────────────────────┤
 * │ PUT    /api/ui/blog/:id                             │ updateBlog           │
 * │        Same fields as POST (all optional)           │                      │
 * ├─────────────────────────────────────────────────────┼──────────────────────┤
 * │ PATCH  /api/ui/blog/:id/toggle                      │ toggleBlogPublish    │
 * │        Flips isPublished: true↔false                │                      │
 * ├─────────────────────────────────────────────────────┼──────────────────────┤
 * │ PATCH  /api/ui/blog/reorder                         │ reorderBlogs         │
 * │        Body: [{ id, displayOrder }, ...]            │                      │
 * ├─────────────────────────────────────────────────────┼──────────────────────┤
 * │ DELETE /api/ui/blog/:id                             │ deleteBlog           │
 * │        Deletes blog + cover image from storage      │                      │
 * └─────────────────────────────────────────────────────┴──────────────────────┘
 *
 * Notes:
 * - Public access: GET without ?all=true returns published blogs only
 * - Admin access: all other endpoints + GET with ?all=true
 * - Cover image validation: JPEG, PNG, WebP, AVIF; max 10 MB
 * - Slug auto-generated from title if not provided
 * - All routes run in Node.js runtime due to file handling
 */

export const BLOG_ROUTES = {
  list:       "GET    /api/ui/blog",
  getById:    "GET    /api/ui/blog/:id",
  getBySlug:  "GET    /api/ui/blog/slug/:slug",
  create:     "POST   /api/ui/blog",
  update:     "PUT    /api/ui/blog/:id",
  toggle:     "PATCH  /api/ui/blog/:id/toggle",
  reorder:    "PATCH  /api/ui/blog/reorder",
  delete:     "DELETE /api/ui/blog/:id",
} as const;

export {
  getBlogs,
  getBlog,
  getBlogBySlug,
  createBlog,
  updateBlog,
  toggleBlogPublish,
  reorderBlogs,
  deleteBlog,
} from "./blogController";
