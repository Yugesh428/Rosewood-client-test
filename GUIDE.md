# Rosewood Admin — Developer Guide

Everything you need to build the remaining admin pages consistently.
Read this before touching any of the 8 new pages.

---

## 1. Project Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui (base-nova style) |
| Base UI engine | `@base-ui/react` |
| Icons | `lucide-react` |
| ORM | Sequelize + PostgreSQL |
| Auth | NextAuth.js |
| Toasts | Sonner (`toast.success` / `toast.error`) |
| Animations | Framer Motion |

---

## 2. Colour Palette

These are the **only** colours used across the project. Never invent new ones.

### Brand Colours (hardcoded where needed)

| Name | Hex | Where used |
|------|-----|-----------|
| Gold | `#D4AF37` | Accents, borders, icons, focus rings, active states |
| Gold light | `#ffe87c` | Gradient highlights on gold |
| Gold dark | `#b8952e` | Gradient end on gold |
| Charcoal | `#1A1A1A` | Primary text, headings, dark buttons |
| Off-white | `#F9F9F9` | Page background |
| White | `#FFFFFF` | Card/panel background |
| Border | `#E5E5E5` | All dividers, input borders, card outlines |
| Muted text | `#6B6B6B` | Secondary/helper text |
| Placeholder | `#ABABAB` | Input placeholder text |

### CSS Variables (Tailwind tokens — prefer these in Tailwind classes)

```
bg-background        →  #F9F9F9
bg-card              →  #FFFFFF
text-foreground      →  #1A1A1A
text-muted-foreground→  #6B6B6B
border-border        →  #E5E5E5
border-input         →  #E5E5E5
bg-primary           →  #000000
text-primary-foreground → #FFFFFF
bg-accent            →  #D4AF37  (gold)
text-accent-foreground  → #000000
ring                 →  #D4AF37
```

### Sidebar colours (inline styles — do NOT change)

```js
background: "linear-gradient(180deg, #1c1c1c 0%, #141414 60%, #111111 100%)"
gold glow:  "drop-shadow(0 0 6px rgba(255,232,124,0.9)) drop-shadow(0 0 12px rgba(212,175,55,0.6))"
gold bar:   "linear-gradient(135deg, #D4AF37 0%, #ffe87c 50%, #b8952e 100%)"
```

### Status colours (Tailwind only)

```
Active / Success  →  bg-green-100 text-green-800
Warning / Pending →  bg-yellow-100 text-yellow-800
Error / Danger    →  bg-red-100 text-red-800   (or bg-red-50 for softer)
Inactive / Off    →  bg-gray-100 text-gray-600
Gold badge        →  bg-[#D4AF37]/10 text-[#b8952e] border border-[#D4AF37]/30
```

---

## 3. Typography

### Fonts loaded in `src/app/layout.tsx`

| CSS Variable | Google Font | Usage |
|---|---|---|
| `--font-heading` | **Libre Caslon Text** (400, 700, italic) | All headings: h1–h6, `font-heading` class |
| `--font-sans` | **Inter** | All body copy, labels, buttons, inputs |

### Tailwind font classes

```
font-heading   →  Libre Caslon Text (serif, elegant)
font-sans      →  Inter (clean, readable)
font-mono      →  system monospace (code only)
```

### Type scale used in admin panels

| Element | Classes |
|---------|---------|
| Page title | `font-heading text-3xl text-[#1A1A1A]` |
| Section heading | `font-heading text-xl text-[#1A1A1A]` |
| Card title | `font-heading text-base` |
| Table header | `text-sm font-medium text-[#1A1A1A]` |
| Body text | `text-sm text-[#1A1A1A] font-sans` |
| Helper / muted | `text-xs text-[#6B6B6B] font-sans` |
| Uppercase label | `text-xs tracking-[0.25em] uppercase text-[#D4AF37] font-sans` |
| Input text | `text-sm font-sans` |

---

## 4. Installed shadcn/ui Components

Style: **base-nova** — uses `@base-ui/react` primitives under the hood.

| Component | Import path | Notes |
|-----------|------------|-------|
| `Button` | `@/components/ui/button` | variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link` |
| `Card` | `@/components/ui/card` | + `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction` |
| `Input` | `@/components/ui/input` | Built on `@base-ui/react/input` |
| `Label` | `@/components/ui/label` | Handles disabled state automatically |
| `Badge` | `@/components/ui/badge` | variants: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link` |
| `Spinner` | `@/components/ui/spinner` | Loading indicator |

### Installing more shadcn components

```bash
npx shadcn@latest add <component-name>
```

Examples you'll likely need:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add dropdown-menu
npx shadcn@latest add alert-dialog
npx shadcn@latest add tabs
npx shadcn@latest add textarea
npx shadcn@latest add checkbox
npx shadcn@latest add switch
npx shadcn@latest add tooltip
npx shadcn@latest add separator
npx shadcn@latest add sheet
```

> Always run from `C:\Users\Acer\Desktop\RosewoodFinal\rosewood`

---

## 5. Admin Page Layout Pattern

Every admin page follows the **exact same shell** — the sidebar + layout wrapper are
provided by `AdminLayout`. Your `page.tsx` only needs to return the content inside.

### File locations

```
src/app/(admin)/admin/<section>/page.tsx      ← route
src/components/admin/<section>/               ← your components go here
```

### Minimal page.tsx template

```tsx
"use client";

import YourSectionClient from "@/components/admin/<section>/YourSectionClient";

export default function SectionPage() {
  return <YourSectionClient />;
}
```

Move all state and logic into the `_components` or `src/components/admin/<section>/`
folder. Keep `page.tsx` as a thin shell.

---

## 6. Admin Panel UI Patterns

### Page wrapper

```tsx
<div className="p-8 bg-gray-50 min-h-screen">
  {/* content */}
</div>
```

### Page header with action button

```tsx
<div className="flex flex-wrap items-center justify-between gap-4 mb-6">
  <h1 className="text-3xl font-heading text-[#1A1A1A]">Section Name</h1>
  <button
    onClick={openCreateModal}
    className="px-4 py-2 rounded-md bg-[#D4AF37] text-white text-sm font-medium hover:bg-[#b8972e] transition-colors"
  >
    + Add Item
  </button>
</div>
```

### Search + filter bar

```tsx
<div className="flex flex-wrap items-center gap-3 mb-4">
  <input
    type="text"
    placeholder="Search..."
    className="flex-1 min-w-[200px] rounded-md border border-[#E5E5E5] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
  />
  <select className="rounded-md border border-[#E5E5E5] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">
    <option value="">All</option>
  </select>
  <button className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">
    Clear filters
  </button>
</div>
```

### Table

```tsx
<div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] overflow-hidden">
  <table className="w-full text-sm">
    <thead className="bg-[#F9F9F9] border-b border-[#E5E5E5]">
      <tr>
        <th className="px-4 py-3 text-left font-medium text-[#1A1A1A]">Name</th>
        <th className="px-4 py-3 text-left font-medium text-[#1A1A1A]">Status</th>
        <th className="px-4 py-3 text-right font-medium text-[#1A1A1A]">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-[#E5E5E5] hover:bg-[#F9F9F9]/50">
        <td className="px-4 py-3">...</td>
        <td className="px-4 py-3">
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Active
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end items-center gap-2">
            {/* edit / delete buttons */}
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Modal (create / edit)

```tsx
{modalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-heading mb-4">Add / Edit Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Text input */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A]">
            Field Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="mt-1 w-full rounded-md border border-[#E5E5E5] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-md border border-[#E5E5E5] text-sm font-medium text-[#1A1A1A] hover:bg-[#F9F9F9]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-md bg-[#D4AF37] text-white text-sm font-medium hover:bg-[#b8972e] disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>

      </form>
    </div>
  </div>
)}
```

### Loading spinner

```tsx
<div className="flex justify-center py-12">
  <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
</div>
```

### Action buttons (table row)

```tsx
{/* Toggle active */}
<button
  onClick={() => handleToggle(item.id)}
  className="p-1 rounded hover:bg-[#F9F9F9] text-[#D4AF37]"
  title="Toggle active"
>✓</button>

{/* Edit */}
<button
  onClick={() => openEditModal(item)}
  className="p-1 rounded hover:bg-[#F9F9F9] text-[#1A1A1A]"
  title="Edit"
>✎</button>

{/* Delete */}
<button
  onClick={() => handleDelete(item.id)}
  className="p-1 rounded hover:bg-red-50 text-red-500"
  title="Delete"
>✕</button>
```

---

## 7. Toast Notifications

Use **Sonner** — already wired into the layout via `ToastProvider`.

```tsx
import { toast } from "sonner";

toast.success("Item created successfully!");
toast.error("Something went wrong. Please try again.");
toast.loading("Saving...");   // returns an id
toast.dismiss(id);
```

Never use `alert()`, inline error banners, or `setError` state for user feedback.

---

## 8. API Endpoints Reference

### Products
```
GET    /api/products              list (query: ?category=, ?active=)
POST   /api/products              create
GET    /api/products/[id]         single
PUT    /api/products/[id]         update
DELETE /api/products/[id]         delete
PATCH  /api/products/[id]/toggle-active
POST   /api/products/bulk         bulk create
GET    /api/products/[id]/ingredients
POST   /api/products/[id]/ingredients
DELETE /api/products/[id]/ingredients/[ingredientId]
```

### Categories
```
GET    /api/product-categories
POST   /api/product-categories
GET    /api/product-categories/[id]
PUT    /api/product-categories/[id]
DELETE /api/product-categories/[id]
PATCH  /api/product-categories/[id]/toggle-active
POST   /api/product-categories/bulk
```

### Inventory
```
GET    /api/inventory
POST   /api/inventory
GET    /api/inventory/[id]
PUT    /api/inventory/[id]
DELETE /api/inventory/[id]
PATCH  /api/inventory/[id]/toggle-active
PATCH  /api/inventory/[id]/adjust-stock   body: { quantity, reason }
POST   /api/inventory/deduct
POST   /api/inventory/restore
GET    /api/inventory/product/[productId]
```

### Orders
```
GET    /api/orders                list (query: ?status=, ?customer=)
POST   /api/orders
GET    /api/orders/[id]
PUT    /api/orders/[id]
DELETE /api/orders/[id]
PATCH  /api/orders/[id]/status    body: { status }
PATCH  /api/orders/[id]/payment   body: { paymentStatus }
GET    /api/orders/stats
GET    /api/orders/guest/track    query: ?orderNumber=&email=
GET    /api/order-items
POST   /api/order-items
GET    /api/order-items/[id]
PUT    /api/order-items/[id]
DELETE /api/order-items/[id]
```

### Customers
```
GET    /api/customers
GET    /api/customers/[id]
PUT    /api/customers/[id]
DELETE /api/customers/[id]
PATCH  /api/customers/[id]/toggle-active
GET    /api/customers/[id]/orders
GET    /api/customers/stats
```

### Staff
```
GET    /api/staff
POST   /api/staff
GET    /api/staff/[id]
PUT    /api/staff/[id]
DELETE /api/staff/[id]
POST   /api/staff/bulk
```

### Reviews
```
GET    /api/reviews               list (query: ?approved=, ?productId=)
GET    /api/reviews/[id]
DELETE /api/reviews/[id]
PATCH  /api/reviews/[id]/approve
GET    /api/reviews/customer/[customerId]
```

### Feedback
```
GET    /api/feedback
GET    /api/feedback/[id]
DELETE /api/feedback/[id]
PATCH  /api/feedback/[id]/status  body: { status }
```

---

## 9. Fetch Pattern (standard async data loading)

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

type Item = { id: string; name: string; isActive: boolean };

export default function SectionClient() {
  const [items, setItems]     = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/<endpoint>");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setItems(json.data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      const res  = await fetch(`/api/<endpoint>/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success("Deleted successfully");
      await fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return <div>{/* your table */}</div>;
}
```

---

## 10. File Upload Pattern

For endpoints that accept files (images, videos), use `FormData`:

```tsx
const handleSubmit = async () => {
  const form = new FormData();
  form.append("image", fileInput);         // file field
  form.append("title", formData.title);    // text fields

  const res  = await fetch("/api/<endpoint>", { method: "POST", body: form });
  const json = await res.json();
};
```

For JSON-only endpoints:

```tsx
const res = await fetch("/api/<endpoint>", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
```

---

## 11. Image Display Rules

Any image whose `src` starts with `/uploads/` **must** have `unoptimized` prop:

```tsx
import Image from "next/image";

<Image
  src={item.imageUrl}
  alt={item.title}
  fill
  className="object-cover"
  unoptimized={item.imageUrl.startsWith("/uploads/")}
/>
```

External URLs (https://...) do **not** need `unoptimized`.

---

## 12. Project Folder Map

```
src/
├── app/
│   ├── (admin)/admin/
│   │   ├── dashboard/          ← stats, recent orders, stock alerts
│   │   ├── products/           ← YOU BUILD
│   │   ├── categories/         ← YOU BUILD
│   │   ├── inventory/          ← YOU BUILD
│   │   ├── orders/             ← YOU BUILD
│   │   ├── customers/          ← YOU BUILD
│   │   ├── staff/              ← YOU BUILD
│   │   ├── reviews/            ← YOU BUILD
│   │   ├── feedback/           ← YOU BUILD
│   │   └── site-content/       ← DONE (CMS)
│   ├── (customer)/             ← login, register, account
│   ├── about/                  ← public about page
│   ├── contact/                ← public contact page
│   └── page.tsx                ← public homepage
│
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── products/           ← YOUR COMPONENTS
│   │   ├── categories/         ← YOUR COMPONENTS
│   │   ├── inventory/          ← YOUR COMPONENTS
│   │   ├── orders/             ← YOUR COMPONENTS
│   │   ├── customers/          ← YOUR COMPONENTS
│   │   ├── staff/              ← YOUR COMPONENTS
│   │   ├── reviews/            ← YOUR COMPONENTS
│   │   └── feedback/           ← YOUR COMPONENTS
│   ├── home/                   ← public homepage dynamic components
│   ├── about/                  ← public about page dynamic components
│   ├── contact/                ← public contact page dynamic components
│   ├── publicPages/            ← CMS editor components (admin site-content)
│   ├── providers/ToastProvider.tsx
│   └── ui/                     ← shadcn components
│
├── features/                   ← backend: models + controllers + routes
│   ├── products/
│   ├── productCategory/
│   ├── inventory/
│   ├── orders/
│   ├── orderItems/
│   ├── customers/
│   ├── staff/
│   ├── reviews/
│   ├── feedback/
│   ├── guestCart/
│   ├── wishlist/
│   └── Ui/                     ← CMS feature backends
│
└── lib/
    ├── database/
    │   ├── sequelize.ts        ← DB connection
    │   ├── sync.ts             ← run with: npm run db:sync
    │   └── migrate.ts          ← run with: npm run db:migrate
    ├── apiError.ts             ← AppError + errorResponse helper
    └── logger.ts               ← logger.info / logger.error
```

---

## 13. Quick Rules

1. **No inline error banners** — always `toast.error()` / `toast.success()`
2. **No hardcoded colours outside the palette** — use the values from section 2
3. **Always use `font-heading` for titles**, `font-sans` for everything else
4. **Match the table + modal pattern** from section 6 exactly — keeps pages consistent
5. **`unoptimized` on all `/uploads/` images** — Next.js Image rule
6. **Keep `page.tsx` thin** — put logic/state in components under `src/components/admin/<section>/`
7. **Confirm before delete** — always `confirm()` or use an `AlertDialog` before destructive actions
8. **Loading state on every data fetch** — use the gold spinner pattern
