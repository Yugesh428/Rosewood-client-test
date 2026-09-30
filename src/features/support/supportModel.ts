import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../lib/database/sequelize";

class SupportTicket extends Model<
  InferAttributes<SupportTicket>,
  InferCreationAttributes<SupportTicket>
> {
  declare id: CreationOptional<string>;
  declare ticketNumber: string;
  declare customerId: string | null;
  declare customerName: string;
  declare customerEmail: string;
  declare customerPhone: string | null;
  declare subject: string;
  declare category: string;
  declare status: "open" | "in_progress" | "resolved" | "closed";
  declare message: string;
  declare assignedTo: string | null;
  declare adminReply: string | null;
  declare resolvedAt: Date | null;
  declare closedAt: Date | null;

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
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    customerEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    customerPhone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "General",
    },
    status: {
      type: DataTypes.ENUM("open", "in_progress", "resolved", "closed"),
      allowNull: false,
      defaultValue: "open",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    adminReply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
      { fields: ["customerEmail"] },
      { fields: ["status"] },
      { fields: ["category"] },
      { fields: ["createdAt"] },
    ],
  }
);

export default SupportTicket;
