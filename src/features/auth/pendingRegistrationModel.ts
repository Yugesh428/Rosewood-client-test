import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/database/sequelize";

interface PendingRegistrationAttributes {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  otpCode: string;
  otpExpiry: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class PendingRegistration extends Model<PendingRegistrationAttributes> implements PendingRegistrationAttributes {
  declare id: string;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare otpCode: string;
  declare otpExpiry: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

PendingRegistration.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    otpCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "pending_registrations",
    timestamps: true,
    indexes: [
      { fields: ["email"] },
      { fields: ["otpExpiry"] }, // for cleanup of expired entries
    ],
  }
);

export default PendingRegistration;
