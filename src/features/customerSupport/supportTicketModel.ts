import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "@/lib/database/sequelize";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "order" | "product" | "delivery" | "prescription" | "account" | "other";

class SupportTicket extends Model<
  InferAttributes<SupportTicket>,
  InferCreationAttributes<SupportTicket>
> {
  declare id: CreationOptional<string>;
  declare ticketNumber: CreationOptional<string>; // e.g. "TKT-2024-001"
  declare customerId: CreationOptional<string | null>; // null for guest tickets
  declare customerName: string;
  declare customerEmail: string;
  declare customerPhone: CreationOptional<string | null>;
  declare subject: string;
  declare message: string;
  declare category: TicketCategory;
  declare priority: CreationOptional<TicketPriority>;
  declare status: CreationOptional<TicketStatus>;
  declare assignedTo: CreationOptional<string | null>; // staff ID
  declare adminNotes: CreationOptional<string | null>;
  declare resolvedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

SupportTicket.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    ticketNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: { msg: "Name is required" } },
    },
    customerEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Email is required" },
        isEmail: { msg: "Invalid email format" },
      },
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
    },
    subject: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: { notEmpty: { msg: "Subject is required" } },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: "Message is required" } },
    },
    category: {
      type: DataTypes.ENUM("order", "product", "delivery", "prescription", "account", "other"),
      allowNull: false,
      defaultValue: "other",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      allowNull: false,
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.ENUM("open", "in_progress", "resolved", "closed"),
      allowNull: false,
      defaultValue: "open",
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "support_tickets",
    timestamps: true,
    freezeTableName: true,
    indexes: [
      { fields: ["ticketNumber"], unique: true },
      { fields: ["status"] },
      { fields: ["priority"] },
      { fields: ["category"] },
      { fields: ["customerEmail"] },
      { fields: ["customerId"] },
      { fields: ["createdAt"] },
    ],
  },
);

export default SupportTicket;
