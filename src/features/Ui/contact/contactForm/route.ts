// app/api/ui/contact/index.ts

export const CONTACT_ROUTES = {
  list: "GET    /api/ui/contact",
  create: "POST   /api/ui/contact",
  get: "GET    /api/ui/contact/:id",
  toggle: "PATCH  /api/ui/contact/:id/read",
  delete: "DELETE /api/ui/contact/:id",
} as const;

export {
  getMessages,
  createMessage,
  getMessage,
  toggleRead,
  deleteMessage,
} from "./contactController";
