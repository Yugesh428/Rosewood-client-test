import { Op } from "sequelize";
import SupportTicket, { TicketStatus, TicketPriority } from "./supportTicketModel";

// ─── Generate unique ticket number ─────────────────────────────────────────────
async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TKT-${year}-`;
  
  // Find the highest ticket number for this year
  const lastTicket = await SupportTicket.findOne({
    where: {
      ticketNumber: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [["createdAt", "DESC"]],
  });

  let nextNum = 1;
  if (lastTicket) {
    const lastNum = parseInt(lastTicket.ticketNumber.split("-")[2]);
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}

// ─── Get all tickets (admin) ───────────────────────────────────────────────────
export async function getTickets(filters?: {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  search?: string;
}) {
  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.priority) {
    where.priority = filters.priority;
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
      ["status", "ASC"], // open first
      ["priority", "DESC"], // urgent first
      ["createdAt", "DESC"],
    ],
  });

  return tickets;
}

// ─── Get single ticket by ID ───────────────────────────────────────────────────
export async function getTicketById(id: string) {
  const ticket = await SupportTicket.findByPk(id);
  return ticket;
}

// ─── Get ticket by ticket number ───────────────────────────────────────────────
export async function getTicketByNumber(ticketNumber: string) {
  const ticket = await SupportTicket.findOne({
    where: { ticketNumber },
  });
  return ticket;
}

// ─── Create new ticket (customer) ──────────────────────────────────────────────
export async function createTicket(data: {
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  message: string;
  category: string;
}) {
  const ticketNumber = await generateTicketNumber();

  const ticket = await SupportTicket.create({
    ticketNumber,
    customerId: data.customerId || null,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone || null,
    subject: data.subject,
    message: data.message,
    category: data.category as any,
    priority: "medium", // default
    status: "open", // default
  });

  return ticket;
}

// ─── Update ticket (admin) ─────────────────────────────────────────────────────
export async function updateTicket(
  id: string,
  data: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string | null;
    adminNotes?: string;
  }
) {
  const ticket = await SupportTicket.findByPk(id);
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  // If status is being changed to resolved, set resolvedAt
  if (data.status === "resolved" && ticket.status !== "resolved") {
    await ticket.update({
      ...data,
      resolvedAt: new Date(),
    });
  } else {
    await ticket.update(data);
  }

  return ticket;
}

// ─── Delete ticket (admin) ─────────────────────────────────────────────────────
export async function deleteTicket(id: string) {
  const ticket = await SupportTicket.findByPk(id);
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  await ticket.destroy();
  return { message: "Ticket deleted successfully" };
}

// ─── Get ticket statistics (admin dashboard) ───────────────────────────────────
export async function getTicketStats() {
  const [total, open, inProgress, resolved, closed] = await Promise.all([
    SupportTicket.count(),
    SupportTicket.count({ where: { status: "open" } }),
    SupportTicket.count({ where: { status: "in_progress" } }),
    SupportTicket.count({ where: { status: "resolved" } }),
    SupportTicket.count({ where: { status: "closed" } }),
  ]);

  return {
    total,
    open,
    inProgress,
    resolved,
    closed,
  };
}
