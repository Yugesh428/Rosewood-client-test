import {
  DataTypes, Model,
  InferAttributes, InferCreationAttributes, CreationOptional,
} from "sequelize";
import sequelize from "../../../lib/database/sequelize";

/**
 * DiscoverSection — Singleton editorial "Discover" block on the home page.
 *
 * Main card (always visible):
 *   eyebrow     : small caps label          e.g. "THE ROSEWOOD PODCAST"
 *   heading     : large serif title         e.g. "We are back with Season 3!"
 *   description : short paragraph
 *   mainImage   : left-side image
 *   ctaText     : button label              e.g. "DISCOVER MORE"
 *
 * Expanded section (shown after clicking Discover More):
 *   expandTitle        : heading            e.g. "We are Back with Season 3!"
 *   expandDescription  : longer text
 *   expandBtn1Text     : e.g. "LISTEN ON SPOTIFY"
 *   expandBtn1Link     : URL
 *   expandBtn2Text     : e.g. "WATCH"
 *   expandBtn2Link     : URL
 *   expandImage        : right-side image
 *   expandImageLabel   : overlay text       e.g. "THE CONVERSATION CONTINUES"
 *   diveDiveInto       : second eyebrow     e.g. "DIVE INTO"
 *   diveHeading        : second heading     e.g. "All things Beauty & Wellbeing"
 *   diveDescription    : second paragraph
 *   videoImage         : big video thumbnail image
 *   videoLabel         : overlay label      e.g. "DR IVONA IGRC"
 *   videoTitle         : overlay title      e.g. "Dr Ivy"
 *   videoUrl           : link/embed URL
 */
class DiscoverSection extends Model<
  InferAttributes<DiscoverSection>,
  InferCreationAttributes<DiscoverSection>
> {
  declare id: CreationOptional<number>;

  // ── Main card ──
  declare eyebrow:           CreationOptional<string | null>;
  declare heading:           CreationOptional<string | null>;
  declare description:       CreationOptional<string | null>;
  declare mainImage:         CreationOptional<string | null>;
  declare ctaText:           CreationOptional<string | null>;

  // ── Expanded top block ──
  declare expandTitle:       CreationOptional<string | null>;
  declare expandDescription: CreationOptional<string | null>;
  declare expandBtn1Text:    CreationOptional<string | null>;
  declare expandBtn1Link:    CreationOptional<string | null>;
  declare expandBtn2Text:    CreationOptional<string | null>;
  declare expandBtn2Link:    CreationOptional<string | null>;
  declare expandImage:       CreationOptional<string | null>;
  declare expandImageLabel:  CreationOptional<string | null>;

  // ── Expanded dive block ──
  declare diveInto:          CreationOptional<string | null>;
  declare diveHeading:       CreationOptional<string | null>;
  declare diveDescription:   CreationOptional<string | null>;

  // ── Video block ──
  declare videoImage:        CreationOptional<string | null>;
  declare videoLabel:        CreationOptional<string | null>;
  declare videoTitle:        CreationOptional<string | null>;
  declare videoUrl:          CreationOptional<string | null>;

  declare isActive:  CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

DiscoverSection.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },

    eyebrow:           { type: DataTypes.STRING(150),  allowNull: true, defaultValue: null },
    heading:           { type: DataTypes.STRING(255),  allowNull: true, defaultValue: null },
    description:       { type: DataTypes.TEXT,         allowNull: true, defaultValue: null },
    mainImage:         { type: DataTypes.STRING(1000), allowNull: true, defaultValue: null },
    ctaText:           { type: DataTypes.STRING(100),  allowNull: true, defaultValue: "DISCOVER MORE" },

    expandTitle:       { type: DataTypes.STRING(255),  allowNull: true, defaultValue: null },
    expandDescription: { type: DataTypes.TEXT,         allowNull: true, defaultValue: null },
    expandBtn1Text:    { type: DataTypes.STRING(100),  allowNull: true, defaultValue: null },
    expandBtn1Link:    { type: DataTypes.STRING(500),  allowNull: true, defaultValue: null },
    expandBtn2Text:    { type: DataTypes.STRING(100),  allowNull: true, defaultValue: null },
    expandBtn2Link:    { type: DataTypes.STRING(500),  allowNull: true, defaultValue: null },
    expandImage:       { type: DataTypes.STRING(1000), allowNull: true, defaultValue: null },
    expandImageLabel:  { type: DataTypes.STRING(255),  allowNull: true, defaultValue: null },

    diveInto:          { type: DataTypes.STRING(100),  allowNull: true, defaultValue: null },
    diveHeading:       { type: DataTypes.STRING(255),  allowNull: true, defaultValue: null },
    diveDescription:   { type: DataTypes.TEXT,         allowNull: true, defaultValue: null },

    videoImage:        { type: DataTypes.STRING(1000), allowNull: true, defaultValue: null },
    videoLabel:        { type: DataTypes.STRING(150),  allowNull: true, defaultValue: null },
    videoTitle:        { type: DataTypes.STRING(255),  allowNull: true, defaultValue: null },
    videoUrl:          { type: DataTypes.STRING(1000), allowNull: true, defaultValue: null },

    isActive:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: { type: DataTypes.DATE,    allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE,    allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "ui_discover_section",
    timestamps: true,
    freezeTableName: true,
  },
);

export default DiscoverSection;
