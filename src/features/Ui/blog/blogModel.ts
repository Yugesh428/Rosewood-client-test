import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../lib/database/sequelize";

class Blog extends Model<
  InferAttributes<Blog>,
  InferCreationAttributes<Blog>
> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare slug: string;
  declare category: string; // e.g., "Skin Care", "GIFTING", "WELLNESS"
  declare excerpt: string; // Short description for listing pages
  declare content: string; // Rich HTML content for detail page
  declare coverImage: string; // public URL for main hero image
  declare authorName: CreationOptional<string>; // e.g., "Prakriti Team"
  declare authorRole: CreationOptional<string>; // e.g., "Author"
  declare date: string; // Display date like "12 January 2026"
  declare isPublished: CreationOptional<boolean>;
  declare isFeatured: CreationOptional<boolean>; // For homepage/sidebar display
  declare displayOrder: CreationOptional<number>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Blog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(512),
      allowNull: false,
      validate: { notEmpty: { msg: "Title is required" } },
    },
    slug: {
      type: DataTypes.STRING(512),
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: "Slug is required" } },
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Skin Care",
      validate: { notEmpty: { msg: "Category is required" } },
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: "Excerpt is required" } },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: "Content is required" } },
    },
    coverImage: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      validate: { notEmpty: { msg: "Cover image is required" } },
    },
    authorName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Prakriti Team",
    },
    authorRole: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Author",
    },
    date: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: { msg: "Date is required" } },
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: "blogs",
    timestamps: true,
    freezeTableName: true,
    indexes: [
      { unique: true, fields: ["slug"] },
      { fields: ["isPublished"] },
      { fields: ["isFeatured"] },
      { fields: ["displayOrder"] },
      { fields: ["category"] },
    ],
  },
);

export default Blog;
