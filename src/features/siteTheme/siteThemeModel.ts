import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../lib/database/sequelize";

export type ThemeKey = "gold" | "medical";

export interface SiteThemeAttributes {
  id:         number;  // always 1 — singleton row
  activeTheme: ThemeKey;
  updatedAt?: Date;
}

export interface SiteThemeCreationAttributes
  extends Optional<SiteThemeAttributes, "id" | "updatedAt"> {}

class SiteTheme
  extends Model<SiteThemeAttributes, SiteThemeCreationAttributes>
  implements SiteThemeAttributes
{
  declare id:          number;
  declare activeTheme: ThemeKey;
  declare readonly updatedAt?: Date;
}

SiteTheme.init(
  {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      defaultValue:  1,
      allowNull:     false,
    },
    activeTheme: {
      type:         DataTypes.ENUM("gold", "medical"),
      allowNull:    false,
      defaultValue: "gold",
    },
    updatedAt: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName:  "SiteTheme",
    tableName:  "site_theme",
    timestamps: false,
  },
);

export default SiteTheme;
