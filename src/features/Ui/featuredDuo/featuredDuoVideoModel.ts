import {
  DataTypes, Model,
  InferAttributes, InferCreationAttributes, CreationOptional,
} from "sequelize";
import sequelize from "../../../lib/database/sequelize";

/**
 * FeaturedDuoVideo — individual video entry for the TikTok-style carousel
 * on the FeaturedDuo home page section.
 *
 * Each row = one video in the carousel.
 * Videos are played in order (sortOrder ASC) and cycle continuously.
 */
class FeaturedDuoVideo extends Model<
  InferAttributes<FeaturedDuoVideo>,
  InferCreationAttributes<FeaturedDuoVideo>
> {
  declare id:        CreationOptional<string>;
  declare url:       string;           // real /uploads/... path or external URL
  declare brand:     CreationOptional<string | null>;
  declare title:     CreationOptional<string | null>;
  declare link:      CreationOptional<string | null>;
  declare sortOrder: CreationOptional<number>;
  declare isActive:  CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

FeaturedDuoVideo.init(
  {
    id:        { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    url:       { type: DataTypes.STRING(1000), allowNull: false },
    brand:     { type: DataTypes.STRING(120),  allowNull: true, defaultValue: null },
    title:     { type: DataTypes.STRING(255),  allowNull: true, defaultValue: null },
    link:      { type: DataTypes.STRING(500),  allowNull: true, defaultValue: "/pharmacy" },
    sortOrder: { type: DataTypes.INTEGER,      allowNull: false, defaultValue: 0 },
    isActive:  { type: DataTypes.BOOLEAN,      allowNull: false, defaultValue: true },
    createdAt: { type: DataTypes.DATE,         allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE,         allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName:       "ui_featured_duo_videos",
    timestamps:      true,
    freezeTableName: true,
  },
);

export default FeaturedDuoVideo;
