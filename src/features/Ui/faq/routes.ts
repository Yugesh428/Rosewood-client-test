/**
 * FAQ Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/ui/faq
 *
 * ┌──────────────────────────────────┬─────────────────────┐
 * │ Endpoint                         │ Handler             │
 * ├──────────────────────────────────┼─────────────────────┤
 * │ GET    /api/ui/faq               │ getFaqs             │
 * │        ?all=true, ?category=     │ public / admin      │
 * ├──────────────────────────────────┼─────────────────────┤
 * │ GET    /api/ui/faq/categories    │ getFaqCategories    │
 * ├──────────────────────────────────┼─────────────────────┤
 * │ GET    /api/ui/faq/:id           │ getFaqById          │
 * ├──────────────────────────────────┼─────────────────────┤
 * │ POST   /api/ui/faq               │ createFaq           │
 * ├──────────────────────────────────┼─────────────────────┤
 * │ PUT    /api/ui/faq/:id           │ updateFaq           │
 * ├──────────────────────────────────┼─────────────────────┤
 * │ PATCH  /api/ui/faq/:id/toggle    │ toggleFaq           │
 * ├──────────────────────────────────┼─────────────────────┤
 * │ DELETE /api/ui/faq/:id           │ deleteFaq           │
 * └──────────────────────────────────┴─────────────────────┘
 */

export {
  getFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  toggleFaq,
  deleteFaq,
  getFaqCategories,
} from "./faqController";
