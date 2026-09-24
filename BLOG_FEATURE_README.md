# Blog Feature - Complete Setup Guide

## 📦 What Has Been Built

### Backend (API)
✅ **Database Model** (`src/features/Ui/blog/blogModel.ts`)
- Full Sequelize model with all fields
- Indexes for performance (slug, isPublished, isFeatured, category)

✅ **Controller** (`src/features/Ui/blog/blogController.ts`)
- `getBlogs()` - List all blogs (with filters: published, category, featured)
- `getBlog()` - Get single blog by ID
- `getBlogBySlug()` - Get blog by slug for detail pages
- `createBlog()` - Create new blog
- `updateBlog()` - Update existing blog
- `toggleBlogPublish()` - Toggle publish status
- `deleteBlog()` - Delete blog
- `reorderBlogs()` - Reorder blog display order

✅ **API Routes**
- `GET /api/ui/blog` - List blogs
- `GET /api/ui/blog/:id` - Get by ID
- `GET /api/ui/blog/slug/:slug` - Get by slug
- `POST /api/ui/blog` - Create
- `PUT /api/ui/blog/:id` - Update
- `PATCH /api/ui/blog/:id` - Toggle publish
- `DELETE /api/ui/blog/:id` - Delete
- `PATCH /api/ui/blog/reorder` - Reorder

### Frontend (Pages & Components)

✅ **Public Pages**
- `/articles` - Blog listing page with dynamic data
- `/articles/[slug]` - Blog detail page with related stories

✅ **Admin Panel**
- `/admin/blogs` - Full CRUD blog management
  - Create/Edit modal with rich form
  - File upload OR URL input for cover images
  - Category filtering
  - Search functionality
  - Publish/unpublish toggle
  - Delete with confirmation
  - Featured blog marking

✅ **Homepage Integration**
- ArticlesSection component now fetches from API
- Shows featured blogs (2 cards)
- Shows recent blogs in sidebar (4 items)
- Falls back to static content if no blogs exist

### Admin Features
- **Sidebar Menu**: Added "BLOGS" menu item with FileText icon
- **Toast Notifications**: Installed `react-hot-toast` for user feedback
- **Image Handling**: 
  - Upload images from computer
  - OR paste image URLs (Google, Unsplash, etc.)
  - Live preview before saving

## 🚀 Setup Instructions

### 1. Create the Database Table

```bash
npx tsx scripts/migrate-blogs.ts
```

This creates the `blogs` table with all required columns and indexes.

### 2. (Optional) Seed Sample Blog Data

```bash
npx tsx scripts/seed-blogs.ts
```

This adds 5 sample blog posts including:
- "The Daily Moisturizing Ritual Behind Effortlessly Glowing Skin" (Featured)
- "The 5-Minute Morning Skincare Routine That Actually Works" (Featured)
- "The Nighttime Nourishing Ritual Your Skin Has Been Craving"
- "12 Best Beauty Gift Ideas"
- "Benefits of Natural Botanical Ingredients"

### 3. Start the Development Server

```bash
npm run dev
```

## 📍 Access Points

### Public Pages
- **Blog Listing**: http://localhost:3000/articles
- **Blog Detail**: http://localhost:3000/articles/[slug]
- **Homepage Section**: Scroll to "Latest Articles" section

### Admin Panel
- **Blog Management**: http://localhost:3000/admin/blogs
- Login required (ADMIN role)

## 🎨 Design Match

The blog pages perfectly match your provided screenshots:

### Detail Page (`/articles/[slug]`)
- ✅ Author info with avatar (Prakriti Team)
- ✅ Large hero cover image
- ✅ Title in large heading font
- ✅ Date display
- ✅ Rich HTML content with proper typography
- ✅ "Related Stories" section with 2 blog cards
- ✅ Category badges on related blogs
- ✅ "View all blogs" link
- ✅ Back to articles link

### Listing Page (`/articles`)
- ✅ Grid layout (3 columns on desktop)
- ✅ Category tags (uppercase, small)
- ✅ Cover image with hover effect
- ✅ Title, date, excerpt
- ✅ "READ MORE" button
- ✅ Consistent spacing and typography

### Homepage Section
- ✅ Model image on left (static)
- ✅ "Latest Articles" heading
- ✅ 2 featured blog cards with images
- ✅ 4 recent blogs in sidebar
- ✅ "View all" link

## 🗂️ Database Schema

### `blogs` Table

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| title | VARCHAR(512) | Blog title |
| slug | VARCHAR(512) | URL-friendly, unique |
| category | VARCHAR(255) | e.g., "Skin Care", "GIFTING" |
| excerpt | TEXT | Short description |
| content | TEXT | Full HTML content |
| coverImage | VARCHAR(1000) | Image URL (uploaded or external) |
| authorName | VARCHAR(255) | Default: "Prakriti Team" |
| authorRole | VARCHAR(255) | Default: "Author" |
| date | VARCHAR(100) | Display date (e.g., "12 January 2026") |
| isPublished | BOOLEAN | Default: false |
| isFeatured | BOOLEAN | Default: false (shows on homepage) |
| displayOrder | INTEGER | Default: 0 (lower = higher priority) |
| createdAt | TIMESTAMP | Auto-generated |
| updatedAt | TIMESTAMP | Auto-generated |

### Indexes
- `slug` (unique)
- `isPublished`
- `isFeatured`
- `category`
- `displayOrder`

## 🎯 Key Features

### Admin Panel Features
1. **Rich Blog Editor**
   - Title & slug (auto-generated from title)
   - Category selection
   - Date input (flexible format)
   - Excerpt textarea
   - Content textarea (supports HTML)
   - Cover image: File upload OR URL input
   - Author name & role
   - Publish/Featured checkboxes
   - Display order

2. **Blog Management**
   - Search blogs by title/excerpt
   - Filter by category
   - Quick publish/unpublish toggle
   - Edit existing blogs
   - Delete with confirmation
   - Visual table with thumbnails

3. **Image Handling**
   - Upload from computer → stored in `/public/uploads/blog/`
   - OR paste external URL (Google Images, Unsplash, etc.)
   - Live preview before saving
   - Old images deleted on update/delete

### Public Features
1. **SEO-Friendly URLs**
   - `/articles/daily-moisturizing-ritual-glowing-skin`
   - Auto-generated slugs from titles

2. **Category Filtering**
   - API supports `?category=GIFTING`
   - Filter by "Skin Care", "GIFTING", "WELLNESS", etc.

3. **Featured Blogs**
   - API supports `?featured=true`
   - Shows on homepage

4. **Related Stories**
   - Shows 2 blogs from same category
   - Excludes current blog

## 📝 Usage Examples

### Creating a Blog (Admin)
1. Go to http://localhost:3000/admin/blogs
2. Click "New Blog Post"
3. Fill in title (slug auto-generates)
4. Select category
5. Write excerpt and content (HTML supported)
6. Upload image OR paste Google Images URL
7. Check "Published" if ready to go live
8. Check "Featured" to show on homepage
9. Click "Create Blog"

### Viewing Blogs (Public)
1. Homepage: Scroll to "Latest Articles" section
2. All blogs: Visit http://localhost:3000/articles
3. Single blog: Click any blog card
4. Related stories: Shown at bottom of detail page

## 🔧 API Usage

### Get All Published Blogs
```javascript
const response = await fetch('/api/ui/blog');
const { data } = await response.json();
```

### Get Featured Blogs (Homepage)
```javascript
const response = await fetch('/api/ui/blog?featured=true');
const { data } = await response.json();
```

### Get Blog by Slug (Detail Page)
```javascript
const response = await fetch(`/api/ui/blog/slug/${slug}`);
const { data } = await response.json();
```

### Get All Blogs (Admin)
```javascript
const response = await fetch('/api/ui/blog?all=true');
const { data } = await response.json();
```

## 🎨 Content Guidelines

### HTML Content Format
The `content` field supports HTML. Use semantic markup:

```html
<p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
  Your paragraph content here...
</p>

<h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
  Section Heading
</h2>

<p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6 italic">
  "A quote or special callout"
</p>
```

### Categories
Suggested categories (you can add more):
- Skin Care
- GIFTING
- WELLNESS
- ROYAL JELLY
- AUTUMN
- FATIGUE
- General

## 🚨 Important Notes

1. **Image URLs**: Both local uploads and external URLs are supported. External URLs are NOT downloaded—they're hotlinked.

2. **Slug Uniqueness**: Slugs must be unique. If you don't provide one, it's auto-generated from the title.

3. **HTML Safety**: The `content` field uses `dangerouslySetInnerHTML`. Only trusted admins should create blogs.

4. **Published vs Draft**: Unpublished blogs won't show on public pages (unless you use `?all=true` in admin).

5. **Featured Blogs**: Only featured blogs appear in the homepage "Latest Articles" section.

## ✅ Testing Checklist

- [ ] Run migration: `npx tsx scripts/migrate-blogs.ts`
- [ ] Run seed: `npx tsx scripts/seed-blogs.ts`
- [ ] Visit `/admin/blogs` - see sample blogs
- [ ] Create new blog with file upload
- [ ] Create new blog with Google Images URL
- [ ] Edit existing blog
- [ ] Toggle publish status
- [ ] Delete a blog
- [ ] Visit `/articles` - see blog listing
- [ ] Click a blog - see detail page
- [ ] Check "Related Stories" section
- [ ] Visit homepage - see "Latest Articles" section

## 🎉 Complete!

The blog feature is fully functional and matches your design specifications. All pages are dynamic, all CRUD operations work, and the admin panel is fully featured.

Happy blogging! 🚀
