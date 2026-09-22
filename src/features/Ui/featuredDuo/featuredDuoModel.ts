import {
  DataTypes, Model,
  InferAttributes, InferCreationAttributes, CreationOptional,
} from "sequelize";
import sequelize from "../../../lib/database/sequelize";

/**
 * FeaturedDuo — "Just Landed" / two-panel editorial section on the home page.
 *
 * Stores one singleton row (id = 1).
 * eyebrow    : small caps label above the heading  e.g. "JUST LANDED"
 * heading    : large serif title                   e.g. "Skincare & Hair Care"
 * shopNowUrl : where the "Shop Now" link goes      e.g. "/pharmacy"
 *
 * left/rightImage  : uploaded panel images
 * left/rightBrand  : small label over the image    e.g. "ROMILLY WILDE"
 * left/rightTitle  : overlaid panel heading        e.g. "Proteomic Skincare"
 * left/rightLink   : where each panel links to     e.g. "/pharmacy?category=..."
 */
class FeaturedDuo extends Model<
  InferAttributes<FeaturedDuo>,
  InferCreationAttributes<FeaturedDuo>
> {
  declare id: CreationOptional<number>;

  declare eyebrow:    CreationOptional<string | null>;
  declare heading:    CreationOptional<string | null>;
  declare shopNowUrl: CreationOptional<string | null>;

  declare leftImage:  CreationOptional<string | null>;
  declare leftBrand:  CreationOptional<string | null>;
  declare leftTitle:  CreationOptional<string | null>;
  declare leftLink:   CreationOptional<string | null>;

  declare rightImage: CreationOptional<string | null>;
  declare rightBrand: CreationOptional<string | null>;
  declare rightTitle: CreationOptional<string | null>;
  declare rightLink:  CreationOptional<string | null>;

  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

FeaturedDuo.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },

    eyebrow:    { type: DataTypes.STRING(120),  allowNull: true, defaultValue: null },
    heading:    { type: DataTypes.STRING(255),  allowNull: true, defaultValue: null },
    shopNowUrl: { type: DataTypes.STRING(500),  allowNull: true, defaultValue: "/pharmacy" },

    leftImage:  { type: DataTypes.STRING(1000), allowNull: true, defaultValue: null },
    leftBrand:  { type: DataTypes.STRING(120),  allowNull: true, defaultValue: null },
    leftTitle:  { type: DataTypes.STRING(255),  allowNull: true, defaultValue: null },
    leftLink:   { type: DataTypes.STRING(500),  allowNull: true, defaultValue: "/pharmacy" },

    rightImage: { type: DataTypes.STRING(1000), allowNull: true, defaultValue: null },
    rightBrand: { type: DataTypes.STRING(120),  allowNull: true, defaultValue: null },
    rightTitle: { type: DataTypes.STRING(255),  allowNull: true, defaultValue: null },
    rightLink:  { type: DataTypes.STRING(500),  allowNull: true, defaultValue: "/pharmacy" },

    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "ui_featured_duo",
    timestamps: true,
    freezeTableName: true,
  },
);

export default FeaturedDuo;
