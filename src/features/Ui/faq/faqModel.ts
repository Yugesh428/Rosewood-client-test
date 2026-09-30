import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "@/lib/database/sequelize";

class Faq extends Model<
  InferAttributes<Faq>,
  InferCreationAttributes<Faq>
> {
  declare id: CreationOptional<string>;
  declare question: string;
  declare answer: string;
  declare category: CreationOptional<string | null>;   // e.g. "Ordering", "Delivery"
  declare displayOrder: CreationOptional<number>;
  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Faq.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    question: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: { notEmpty: { msg: "Question is required" } },
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: "Answer is required" } },
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "faqs",
    timestamps: true,
    freezeTableName: true,
    indexes: [{ fields: ["displayOrder"] }, { fields: ["isActive"] }, { fields: ["category"] }],
  },
);

export default Faq;
