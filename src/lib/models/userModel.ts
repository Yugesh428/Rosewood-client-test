import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/sequelize";

export type UserRole = "ADMIN" | "CUSTOMER";

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  otpCode:    string | null;
  otpExpiry:  Date   | null;
  otpPurpose: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "isActive" | "otpCode" | "otpExpiry" | "otpPurpose" | "createdAt" | "updatedAt"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: string;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: UserRole;
  declare isActive: boolean;
  declare otpCode:   CreationOptional<string | null>;
  declare otpExpiry: CreationOptional<Date | null>;
  declare otpPurpose:CreationOptional<string | null>;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("ADMIN", "CUSTOMER"),
      allowNull: false,
      defaultValue: "CUSTOMER",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    otpCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: null,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    otpPurpose: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  },
);

export default User;
