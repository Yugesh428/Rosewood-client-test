import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/database/sequelize";
import User from "@/lib/models/userModel";

/**
 * Notification Model
 * 
 * Stores system notifications for users (customers, staff, admins)
 * Types: order, inventory, customer, system, promo
 */

export type NotificationType = "order" | "inventory" | "customer" | "system" | "promo" | "support";
export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface NotificationAttributes {
  id: string;
  userId: string | null;           // NULL = broadcast to all
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl: string | null;         // Optional link to relevant page
  actionLabel: string | null;       // Button text like "View Order"
  isRead: boolean;
  readAt: Date | null;
  metadata: Record<string, any>;    // Additional data (orderId, productId, etc)
  expiresAt: Date | null;           // Auto-hide after this date
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationCreationAttributes extends Optional<
  NotificationAttributes,
  "id" | "userId" | "priority" | "actionUrl" | "actionLabel" | "isRead" | "readAt" | "metadata" | "expiresAt" | "createdAt" | "updatedAt"
> {}

class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  declare id: string;
  declare userId: string | null;
  declare type: NotificationType;
  declare priority: NotificationPriority;
  declare title: string;
  declare message: string;
  declare actionUrl: string | null;
  declare actionLabel: string | null;
  declare isRead: boolean;
  declare readAt: Date | null;
  declare metadata: Record<string, any>;
  declare expiresAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    type: {
      type: DataTypes.ENUM("order", "inventory", "customer", "system", "promo", "support"),
      allowNull: false,
      defaultValue: "system",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      allowNull: false,
      defaultValue: "medium",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    actionUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    actionLabel: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    expiresAt: {
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
    tableName: "notifications",
    timestamps: true,
    indexes: [
      { fields: ["userId"] },
      { fields: ["isRead"] },
      { fields: ["type"] },
      { fields: ["createdAt"] },
      { fields: ["expiresAt"] },
    ],
  }
);

// Associations
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

export default Notification;
