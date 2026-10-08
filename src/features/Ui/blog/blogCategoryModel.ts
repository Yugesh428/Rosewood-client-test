import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../lib/database/sequelize";

class BlogCategory extends Model<
  InferAttributes<BlogCategory>,
  InferCreationAttributes<BlogCategory>
> {
  declare id: CreationOptional<string>;
  declare name: string; // e.g., "Skin Care", "Wellness"
  declare slug: string; // URL-friendly version: "skin-care", "wellness"
  declare description: CreationOptional<string>; // Optional category description
  declare displayOrder: CreationOptional<number>; // For ordering in UI
  declare isActive: CreationOptional<boolean>; // Can be toggled on/off

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BlogCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Category name is required" },
      },
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Slug is required" },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "blog_categories",
    timestamps: true,
    freezeTableName: true,
    indexes: [
      { unique: true, fields: ["name"] },
      { unique: true, fields: ["slug"] },
      { fields: ["isActive"] },
      { fields: ["displayOrder"] },
    ],
  }
);

export default BlogCategory;
