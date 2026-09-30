import SupportTicket from "./supportModel";
import { Op } from "sequelize";

// Generate unique ticket number
function generateTicketNumber(): string {
  const prefix = "TKT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// ─── Get all tickets (admin) ───────────────────────────────────────────────
export async function getTickets(filters?: {
  status?: string;
  category?: string;
  search?: string;
}) {
  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.search) {
    where[Op.or] = [
      { ticketNumber: { [Op.iLike]: `%${filters.search}%` } },
      { customerName: { [Op.iLike]: `%${filters.search}%` } },
      { customerEmail: { [Op.iLike]: `%${filters.search}%` } },
      { subject: { [Op.iLike]: `%${filters.search}%` } },
    ];
  }

  const tickets = await SupportTicket.findAll({
    where,
    order: [
      ["status", "ASC"],
      ["createdAt", "DESC"],
    ],
  });

  return tickets;
}

// ─── Get single ticket ─────────────────────────────────────────────────────
export async function getTicketById(id: string) {
  const ticket = await SupportTicket.findByPk(id);
  return ticket;
}

// ─── Get ticket by number ──────────────────────────────────────────────────
export async function getTicketByNumber(ticketNumber: string) {
  const ticket = await SupportTicket.findOne({
    where: { ticketNumber },
  });
  return ticket;
}

// ─── Create ticket ─────────────────────────────────────────────────────────
export async function createTicket(data: {
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  category: string;
  message: string;
}) {
  const ticketNumber = generateTicketNumber();

  const ticket = await SupportTicket.create({
    ticketNumber,
    customerId: data.customerId || null,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone || null,
    subject: data.subject,
    category: data.category,
    message: data.message,
    status: "open",
  });

  return ticket;
}

// ─── Update ticket ─────────────────────────────────────────────────────────
export async function updateTicket(
  id: string,
  data: {
    status?: string;
    category?: string;
    assignedTo?: string;
    adminReply?: string;
  }
) {
  const ticket = await SupportTicket.findByPk(id);
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  const updateData: any = {};

  if (data.status) {
    updateData.status = data.status;
    if (data.status === "resolved") {
      updateData.resolvedAt = new Date();
    }
    if (data.status === "closed") {
      updateData.closedAt = new Date();
    }
  }

  if (data.category) updateData.category = data.category;
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
  if (data.adminReply !== undefined) updateData.adminReply = data.adminReply;

  await ticket.update(updateData);
  return ticket;
}

// ─── Delete ticket ─────────────────────────────────────────────────────────
export async function deleteTicket(id: string) {
  const ticket = await SupportTicket.findByPk(id);
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  await ticket.destroy();
  return { success: true };
}

// ─── Get categories ────────────────────────────────────────────────────────
export async function getTicketCategories() {
  const tickets = await SupportTicket.findAll({
    attributes: ["category"],
    group: ["category"],
  });

  return tickets.map((t) => t.category);
}

// ─── Get stats ─────────────────────────────────────────────────────────────
export async function getTicketStats() {
  const total = await SupportTicket.count();
  const open = await SupportTicket.count({ where: { status: "open" } });
  const inProgress = await SupportTicket.count({ where: { status: "in_progress" } });
  const resolved = await SupportTicket.count({ where: { status: "resolved" } });
  const closed = await SupportTicket.count({ where: { status: "closed" } });

  return {
    total,
    open,
    inProgress,
    resolved,
    closed,
  };
}
