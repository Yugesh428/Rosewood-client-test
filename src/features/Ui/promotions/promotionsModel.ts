import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "@/lib/database/sequelize";

/**
 * PromotionSlide — Individual promotion slides in the carousel.
 * 
 * Stores promotional content with eyebrow, brand, title, subtitle, description, CTA, and product image.
 */
class PromotionSlide extends Model<
  InferAttributes<PromotionSlide>,
  InferCreationAttributes<PromotionSlide>
> {
  declare id: CreationOptional<string>;
  declare eyebrow: string | null;           // e.g. "LIMITED TIME"
  declare brand: string | null;             // e.g. "LA ROCHE-POSAY"
  declare title: string | null;             // e.g. "TRUE BEAUTY BEGINS WHERE NATURE TOUCHES THE SKIN"
  declare subtitle: string | null;          // e.g. "Discover skincare crafted with gentle ingredients..."
  declare description: string | null;       // e.g. "on selected lines only until October 12th"
  declare ctaText: string | null;           // e.g. "Order Now"
  declare ctaLink: string | null;           // e.g. "/pharmacy?category=suncare"
  declare bgImage: string | null;           // Product image URL (shown in circle)
  declare order: number;                    // Display order (0-based)
  declare isActive: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

PromotionSlide.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    eyebrow: { type: DataTypes.STRING(100), allowNull: true },
    brand: { type: DataTypes.STRING(150), allowNull: true },
    title: { type: DataTypes.STRING(500), allowNull: true },
    subtitle: { type: DataTypes.TEXT, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    ctaText: { type: DataTypes.STRING(150), allowNull: true },
    ctaLink: { type: DataTypes.STRING(500), allowNull: true },
    bgImage: { type: DataTypes.STRING(500), allowNull: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    tableName: "promotion_slides",
    timestamps: true,
    freezeTableName: true,
  }
);

export default PromotionSlide;
