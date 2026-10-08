import {
  DataTypes, Model,
  InferAttributes, InferCreationAttributes, CreationOptional,
} from "sequelize";
import sequelize from "../../../lib/database/sequelize";

/**
 * AnnouncementMessage — one slide in the top announcement bar.
 *
 * text    : main message text  e.g. "Free delivery on orders over £50"
 * cta     : link label         e.g. "Shop now"
 * link    : href               e.g. "/pharmacy"
 * isActive: toggles visibility per message
 * sortOrder: display order (ASC)
 */
class AnnouncementMessage extends Model<
  InferAttributes<AnnouncementMessage>,
  InferCreationAttributes<AnnouncementMessage>
> {
  declare id:        CreationOptional<string>;
  declare text:      string;
  declare cta:       CreationOptional<string | null>;
  declare link:      CreationOptional<string | null>;
  declare isActive:  CreationOptional<boolean>;
  declare sortOrder: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AnnouncementMessage.init(
  {
    id:        { type: DataTypes.UUID,        primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    text:      { type: DataTypes.STRING(500), allowNull: false },
    cta:       { type: DataTypes.STRING(100), allowNull: true,  defaultValue: null },
    link:      { type: DataTypes.STRING(500), allowNull: true,  defaultValue: "/pharmacy" },
    isActive:  { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: true },
    sortOrder: { type: DataTypes.INTEGER,     allowNull: false, defaultValue: 0 },
    createdAt: { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName:       "ui_announcement_messages",
    timestamps:      true,
    freezeTableName: true,
  },
);

export default AnnouncementMessage;
