import {
  DataTypes, Model,
  InferAttributes, InferCreationAttributes, CreationOptional,
} from "sequelize";
import sequelize from "../../../lib/database/sequelize";

/**
 * FeaturedDuo — editorial section on the home page.
 *
 * Stores one singleton row (id = 1).
 * eyebrow    : small caps label above the heading  e.g. "RARE ITEMS"
 * heading    : large serif title                   e.g. "Skincare & Hair Care"
 * shopNowUrl : where the "Shop Now" link goes      e.g. "/pharmacy"
 *
 * leftImage  : uploaded/URL for the tall portrait photo (lady)
 * leftBrand  : small label over the photo           e.g. "ROMILLY WILDE"
 * leftTitle  : overlaid panel heading               e.g. "Daily Moisture Shield"
 * leftLink   : where the photo links to
 *
 * LEGACY (kept for backward compatibility):
 * videoUrl   : URL for the TikTok-style vertical video (mp4, YouTube, etc.)
 * videoBrand : small label on the video panel       e.g. "AMBER RESTORE SERUM"
 * videoTitle : text overlay on the video            e.g. "Overnight Repair Complex"
 * videoLink  : where the Shop button links to
 *
 * NEW (multi-video carousel):
 * videos     : Array of video objects [{url, brand, title, link}, ...]
 *              Videos auto-cycle continuously when one completes
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

  declare videoUrl:   CreationOptional<string | null>;
  declare videoBrand: CreationOptional<string | null>;
  declare videoTitle: CreationOptional<string | null>;
  declare videoLink:  CreationOptional<string | null>;
  declare videos:     CreationOptional<Array<{url: string; brand?: string; title?: string; link?: string}>>;

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

    videoUrl:   { type: DataTypes.STRING(1000), allowNull: true, defaultValue: null },
    videoBrand: { type: DataTypes.STRING(120),  allowNull: true, defaultValue: null },
    videoTitle: { type: DataTypes.STRING(255),  allowNull: true, defaultValue: null },
    videoLink:  { type: DataTypes.STRING(500),  allowNull: true, defaultValue: "/pharmacy" },
    videos:     { type: DataTypes.JSONB,        allowNull: false, defaultValue: [] },

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
