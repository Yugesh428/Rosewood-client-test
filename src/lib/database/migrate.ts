/**
 * Migration script — run once to apply schema changes safely.
 * Run: npm run db:migrate
 */

import sequelize from "./sequelize";
import User from "../models/userModel";
import Category from "../../features/productCategory/productCatetgoryModel";
import Product from "../../features/products/productModel";
import ProductIngredient from "../../features/products/productIngredientModel";
import Inventory from "../../features/inventory/inventoryModel";
import Order from "../../features/orders/orderModel";
import OrderItem from "../../features/orderItems/orderItemModel";
import Staff from "../../features/staff/staffModel";
import Wishlist from "../../features/wishlist/wishlistModel";
import Review from "../../features/reviews/reviewModel";
import Feedback from "../../features/feedback/feedbackModel";
import GuestCart from "../../features/guestCart/guestCartModel";

// ── UI models ─────────────────────────────────────────────────────────────────
import HeroSection from "../../features/Ui/HeroSection/heroModel/heroModel";
import OurProductCollectionCategory from "../../features/Ui/ourProductCollection/ourProductCollectionCategoryModel";
import OurProduct from "../../features/Ui/ourProductCollection/ourProductContent/ourProductModel";
import Testimonial from "../../features/Ui/testimonials/testimonialsModel";
import AboutUsTitle from "../../features/Ui/AboutUsPage/AboutUs Head/aboutUsTitleModel";
import OurStory from "../../features/Ui/AboutUsPage/ourStory/ourStroyModel";
import Mission from "../../features/Ui/AboutUsPage/ourMisson/missionModel";
import OurValues from "../../features/Ui/AboutUsPage/ourValues/ourValuesModel";
import ContactInfo from "../../features/Ui/contact/contactInfo/contactInfoModel";
import ContactForm from "../../features/Ui/contact/contactForm/contactFormModel";
import SiteTheme from "../../features/siteTheme/siteThemeModel";
import FeaturedDuoVideo from "../../features/Ui/featuredDuo/featuredDuoVideoModel";

import Notification from "../../features/notifications/notificationModel";

async function migrate() {
  const q = sequelize.getQueryInterface();

  try {
    await sequelize.authenticate();
    console.log("✅ DB connected.");

    // ── 1. categories — add parentId if missing ───────────────────────────────
    const categoryColumns = await q.describeTable("categories");
    if (!categoryColumns["parentId"]) {
      console.log("➕ Adding parentId to categories...");
      await sequelize.query(`ALTER TABLE "categories" ADD COLUMN "parentId" UUID DEFAULT NULL;`);
      await sequelize.query(`
        ALTER TABLE "categories"
        ADD CONSTRAINT "categories_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "categories" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log("✅ categories.parentId added.");
    } else {
      console.log("ℹ️  categories.parentId already exists.");
    }

    // Add slug column for SEO-friendly URLs
    if (!categoryColumns["slug"]) {
      console.log("➕ Adding slug to categories...");
      await sequelize.query(`ALTER TABLE "categories" ADD COLUMN "slug" VARCHAR(150) UNIQUE DEFAULT NULL;`);
      console.log("✅ categories.slug added.");
      
      // Generate slugs for existing categories with duplicate handling
      console.log("🔄 Generating slugs for existing categories...");
      const categories = await sequelize.query(`SELECT "id", "categoryName" FROM "categories" WHERE "slug" IS NULL;`, { type: "SELECT" }) as Array<{ id: string; categoryName: string }>;
      
      for (const cat of categories) {
        let baseSlug = cat.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        let slug = baseSlug;
        let counter = 1;
        
        // Check if slug exists, if so add counter
        while (true) {
          const [existing] = await sequelize.query(
            `SELECT "id" FROM "categories" WHERE "slug" = :slug LIMIT 1;`,
            { replacements: { slug }, type: "SELECT" }
          ) as any[];
          
          if (!existing) break;
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        await sequelize.query(
          `UPDATE "categories" SET "slug" = :slug WHERE "id" = :id;`,
          { replacements: { slug, id: cat.id } }
        );
      }
      console.log("✅ Slugs generated for existing categories.");
    } else {
      console.log("ℹ️  categories.slug already exists.");
    }

    // ── 2. users — add isActive if missing ────────────────────────────────────
    const userColumns = await q.describeTable("users");
    if (!userColumns["isActive"]) {
      console.log("➕ Adding isActive to users...");
      await sequelize.query(`ALTER TABLE "users" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT TRUE;`);
      console.log("✅ users.isActive added.");
    } else {
      console.log("ℹ️  users.isActive already exists.");
    }

    // ── 3. products — drop and recreate with correct camelCase columns ────────
    const productColumns = await q.describeTable("products").catch(() => null);

    if (!productColumns) {
      console.log("➕ products table not found — creating with explicit SQL...");
      
      // Create products first
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "products" (
          "id"                  UUID          NOT NULL DEFAULT gen_random_uuid(),
          "categoryId"          UUID          NOT NULL REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          "productName"         VARCHAR(200)  NOT NULL,
          "productImage"        VARCHAR(1000) DEFAULT NULL,
          "dosageForm"          VARCHAR(100)  NOT NULL,
          "strength"            VARCHAR(50)   NOT NULL,
          "packSize"            VARCHAR(50)   NOT NULL,
          "unitType"            VARCHAR(50)   NOT NULL,
          "sellingPrice"        DECIMAL(10,2) NOT NULL,
          "originalPrice"       DECIMAL(10,2) NOT NULL,
          "tax"                 DECIMAL(5,2)  NOT NULL DEFAULT 0,
          "discount"            DECIMAL(5,2)  NOT NULL DEFAULT 0,
          "productDescriptions" JSONB         NOT NULL DEFAULT '[]',
          "specifications"      JSONB         NOT NULL DEFAULT '[]',
          "suitableFor"         JSONB         NOT NULL DEFAULT '[]',
          "isActive"            BOOLEAN       NOT NULL DEFAULT TRUE,
          "createdAt"           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          "updatedAt"           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          PRIMARY KEY ("id")
        );
      `);
      console.log("✅ products table created.");

      // Then create product_ingredients (references products)
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "product_ingredients" (
          "id"             UUID         NOT NULL DEFAULT gen_random_uuid(),
          "productId"      UUID         NOT NULL REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "ingredientName" VARCHAR(200) NOT NULL,
          "quantity"       VARCHAR(50)  DEFAULT NULL,
          "unit"           VARCHAR(50)  DEFAULT NULL,
          "sortOrder"      INTEGER      NOT NULL DEFAULT 0,
          "createdAt"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          "updatedAt"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          PRIMARY KEY ("id")
        );
      `);
      console.log("✅ product_ingredients table created.");
    } else if (!productColumns["categoryId"]) {
      // Table exists but was created with snake_case — drop and recreate
      console.log("🔄 products table has wrong column casing — dropping and recreating...");
      await sequelize.query(`DROP TABLE IF EXISTS "product_ingredients" CASCADE;`);
      await sequelize.query(`DROP TABLE IF EXISTS "products" CASCADE;`);
      console.log("✅ Old products + product_ingredients tables dropped.");

      // Create products first, then product_ingredients (FK dependency order)
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "products" (
          "id"                  UUID          NOT NULL DEFAULT gen_random_uuid(),
          "categoryId"          UUID          NOT NULL REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          "productName"         VARCHAR(200)  NOT NULL,
          "productImage"        VARCHAR(1000) DEFAULT NULL,
          "dosageForm"          VARCHAR(100)  NOT NULL,
          "strength"            VARCHAR(50)   NOT NULL,
          "packSize"            VARCHAR(50)   NOT NULL,
          "unitType"            VARCHAR(50)   NOT NULL,
          "sellingPrice"        DECIMAL(10,2) NOT NULL,
          "originalPrice"       DECIMAL(10,2) NOT NULL,
          "tax"                 DECIMAL(5,2)  NOT NULL DEFAULT 0,
          "discount"            DECIMAL(5,2)  NOT NULL DEFAULT 0,
          "productDescriptions" JSONB         NOT NULL DEFAULT '[]',
          "specifications"      JSONB         NOT NULL DEFAULT '[]',
          "suitableFor"         JSONB         NOT NULL DEFAULT '[]',
          "isActive"            BOOLEAN       NOT NULL DEFAULT TRUE,
          "createdAt"           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          "updatedAt"           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          PRIMARY KEY ("id")
        );
      `);
      console.log("✅ products table created.");

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "product_ingredients" (
          "id"             UUID         NOT NULL DEFAULT gen_random_uuid(),
          "productId"      UUID         NOT NULL REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "ingredientName" VARCHAR(200) NOT NULL,
          "quantity"       VARCHAR(50)  DEFAULT NULL,
          "unit"           VARCHAR(50)  DEFAULT NULL,
          "sortOrder"      INTEGER      NOT NULL DEFAULT 0,
          "createdAt"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          "updatedAt"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          PRIMARY KEY ("id")
        );
      `);
      console.log("✅ product_ingredients table created.");
    } else {
      console.log("ℹ️  products table already correct.");

      // Still check for specifications and suitableFor in case they were missing
      if (!productColumns["specifications"]) {
        console.log("➕ Adding specifications to products...");
        await sequelize.query(`ALTER TABLE "products" ADD COLUMN "specifications" JSONB NOT NULL DEFAULT '[]';`);
        console.log("✅ products.specifications added.");
      }
      if (!productColumns["suitableFor"]) {
        console.log("➕ Adding suitableFor to products...");
        await sequelize.query(`ALTER TABLE "products" ADD COLUMN "suitableFor" JSONB NOT NULL DEFAULT '[]';`);
        console.log("✅ products.suitableFor added.");
      }
    }

    // ── 4. orders — ensure all columns exist (full schema check) ─────────────
    const orderColumns = await q.describeTable("orders").catch(() => null);
    if (orderColumns) {

      // customerId — may be missing if table was created with old schema
      if (!orderColumns["customerId"]) {
        console.log("➕ Adding customerId to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "customerId" UUID DEFAULT NULL;`);
        // Add FK constraint only if users table exists
        await sequelize.query(`
          ALTER TABLE "orders"
          ADD CONSTRAINT "orders_customerId_fkey"
          FOREIGN KEY ("customerId") REFERENCES "users" ("id")
          ON DELETE RESTRICT ON UPDATE CASCADE;
        `).catch(() => console.log("ℹ️  customerId FK already exists or skipped."));
        console.log("✅ orders.customerId added.");
      } else {
        // Make sure it's nullable for guest orders
        const customerIdCol = orderColumns["customerId"] as { allowNull?: boolean } | undefined;
        if (customerIdCol && customerIdCol.allowNull === false) {
          console.log("🔧 Making orders.customerId nullable for guest orders...");
          await sequelize.query(`ALTER TABLE "orders" ALTER COLUMN "customerId" DROP NOT NULL;`);
          console.log("✅ orders.customerId is now nullable.");
        } else {
          console.log("ℹ️  orders.customerId already nullable.");
        }
      }

      if (!orderColumns["isGuest"]) {
        console.log("➕ Adding isGuest to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "isGuest" BOOLEAN NOT NULL DEFAULT FALSE;`);
        console.log("✅ orders.isGuest added.");
      } else {
        console.log("ℹ️  orders.isGuest already exists.");
      }

      if (!orderColumns["guestName"]) {
        console.log("➕ Adding guestName to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "guestName" VARCHAR(255) DEFAULT NULL;`);
        console.log("✅ orders.guestName added.");
      } else {
        console.log("ℹ️  orders.guestName already exists.");
      }

      if (!orderColumns["guestEmail"]) {
        console.log("➕ Adding guestEmail to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "guestEmail" VARCHAR(255) DEFAULT NULL;`);
        console.log("✅ orders.guestEmail added.");
      } else {
        console.log("ℹ️  orders.guestEmail already exists.");
      }

      if (!orderColumns["guestPhone"]) {
        console.log("➕ Adding guestPhone to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "guestPhone" VARCHAR(20) DEFAULT NULL;`);
        console.log("✅ orders.guestPhone added.");
      } else {
        console.log("ℹ️  orders.guestPhone already exists.");
      }

      // Other columns that may be missing in older schemas
      if (!orderColumns["subtotal"]) {
        console.log("➕ Adding subtotal to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0;`);
        console.log("✅ orders.subtotal added.");
      }
      if (!orderColumns["taxAmount"]) {
        console.log("➕ Adding taxAmount to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;`);
        console.log("✅ orders.taxAmount added.");
      }
      if (!orderColumns["discountAmount"]) {
        console.log("➕ Adding discountAmount to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;`);
        console.log("✅ orders.discountAmount added.");
      }
      if (!orderColumns["totalAmount"]) {
        console.log("➕ Adding totalAmount to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;`);
        console.log("✅ orders.totalAmount added.");
      }
      if (!orderColumns["deliveryAddress"]) {
        console.log("➕ Adding deliveryAddress to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "deliveryAddress" TEXT NOT NULL DEFAULT '';`);
        console.log("✅ orders.deliveryAddress added.");
      }
      if (!orderColumns["deliveryNotes"]) {
        console.log("➕ Adding deliveryNotes to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "deliveryNotes" TEXT DEFAULT NULL;`);
        console.log("✅ orders.deliveryNotes added.");
      }
      if (!orderColumns["confirmedAt"]) {
        console.log("➕ Adding confirmedAt to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "confirmedAt" TIMESTAMPTZ DEFAULT NULL;`);
        console.log("✅ orders.confirmedAt added.");
      }
      if (!orderColumns["shippedAt"]) {
        console.log("➕ Adding shippedAt to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "shippedAt" TIMESTAMPTZ DEFAULT NULL;`);
        console.log("✅ orders.shippedAt added.");
      }
      if (!orderColumns["deliveredAt"]) {
        console.log("➕ Adding deliveredAt to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "deliveredAt" TIMESTAMPTZ DEFAULT NULL;`);
        console.log("✅ orders.deliveredAt added.");
      }
      if (!orderColumns["cancelledAt"]) {
        console.log("➕ Adding cancelledAt to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "cancelledAt" TIMESTAMPTZ DEFAULT NULL;`);
        console.log("✅ orders.cancelledAt added.");
      }
      if (!orderColumns["cancellationReason"]) {
        console.log("➕ Adding cancellationReason to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "cancellationReason" TEXT DEFAULT NULL;`);
        console.log("✅ orders.cancellationReason added.");
      }

      // Ensure ENUM types exist for orderStatus and paymentStatus
      if (!orderColumns["orderStatus"]) {
        console.log("➕ Adding orderStatus to orders...");
        await sequelize.query(`
          DO $$ BEGIN
            CREATE TYPE "enum_orders_orderStatus" AS ENUM('pending','confirmed','processing','shipped','delivered','cancelled');
          EXCEPTION WHEN duplicate_object THEN null; END $$;
        `);
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "orderStatus" "enum_orders_orderStatus" NOT NULL DEFAULT 'pending';`);
        console.log("✅ orders.orderStatus added.");
      }
      if (!orderColumns["paymentStatus"]) {
        console.log("➕ Adding paymentStatus to orders...");
        await sequelize.query(`
          DO $$ BEGIN
            CREATE TYPE "enum_orders_paymentStatus" AS ENUM('unpaid','paid','refunded');
          EXCEPTION WHEN duplicate_object THEN null; END $$;
        `);
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "paymentStatus" "enum_orders_paymentStatus" NOT NULL DEFAULT 'unpaid';`);
        console.log("✅ orders.paymentStatus added.");
      }
      if (!orderColumns["paymentMethod"]) {
        console.log("➕ Adding paymentMethod to orders...");
        await sequelize.query(`
          DO $$ BEGIN
            CREATE TYPE "enum_orders_paymentMethod" AS ENUM('cash','card','online','upi');
          EXCEPTION WHEN duplicate_object THEN null; END $$;
        `);
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "paymentMethod" "enum_orders_paymentMethod" NOT NULL DEFAULT 'cash';`);
        console.log("✅ orders.paymentMethod added.");
      }

      console.log("✅ orders table schema verified.");
    } else {
      console.log("ℹ️  orders table not found — will be created by sync.");
    }

    // ── 5. Fix hero_slides table if it exists with old schema ─────────────────
    const heroColumns = await q.describeTable("hero_slides").catch(() => null);
    if (heroColumns) {
      console.log("✅ hero_slides table exists");
      
      // Check if title column exists
      if (!heroColumns["title"]) {
        console.log("➕ Adding title to hero_slides...");
        await sequelize.query(`ALTER TABLE "hero_slides" ADD COLUMN "title" VARCHAR(255) DEFAULT NULL;`);
        console.log("✅ hero_slides.title added.");
      } else {
        console.log("ℹ️  hero_slides.title already exists.");
      }

      // Check if subtitle column exists
      if (!heroColumns["subtitle"]) {
        console.log("➕ Adding subtitle to hero_slides...");
        await sequelize.query(`ALTER TABLE "hero_slides" ADD COLUMN "subtitle" TEXT DEFAULT NULL;`);
        console.log("✅ hero_slides.subtitle added.");
      } else {
        console.log("ℹ️  hero_slides.subtitle already exists.");
      }

      // Check if order column exists
      if (!heroColumns["order"]) {
        console.log("➕ Adding order to hero_slides...");
        await sequelize.query(`ALTER TABLE "hero_slides" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;`);
        console.log("✅ hero_slides.order added.");
      } else {
        console.log("ℹ️  hero_slides.order already exists.");
      }

      // Check if isActive column exists
      if (!heroColumns["isActive"]) {
        console.log("➕ Adding isActive to hero_slides...");
        await sequelize.query(`ALTER TABLE "hero_slides" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT TRUE;`);
        console.log("✅ hero_slides.isActive added.");
      } else {
        console.log("ℹ️  hero_slides.isActive already exists.");
      }
    }

    // ── 6. Add videoFile column to ui_collection_products if missing ──────────
    const productsColumns = await q.describeTable("ui_collection_products").catch(() => null);
    if (productsColumns && !productsColumns["videoFile"]) {
      console.log("➕ Adding videoFile to ui_collection_products...");
      await sequelize.query(`ALTER TABLE "ui_collection_products" ADD COLUMN "videoFile" VARCHAR(1000) DEFAULT NULL;`);
      console.log("✅ ui_collection_products.videoFile added.");
    } else if (productsColumns) {
      console.log("ℹ️  ui_collection_products.videoFile already exists.");
    }

    // ── 7. Create UI tables if missing ─────────────────────────────────────────
    console.log("➕ Creating UI content tables...");

    // ── Add bgGradient to custom_themes BEFORE model sync ─────────────────────
    const customThemeColsEarly = await q.describeTable("custom_themes").catch(() => null);
    if (customThemeColsEarly && !customThemeColsEarly["bgGradient"]) {
      console.log("➕ Adding bgGradient to custom_themes (early)...");
      await sequelize.query(`ALTER TABLE "custom_themes" ADD COLUMN "bgGradient" TEXT DEFAULT NULL;`);
      console.log("✅ custom_themes.bgGradient added.");
    }
    
    // Sync models in explicit order to respect foreign key dependencies
    // Independent tables first
    await User.sync({ force: false, alter: false });
    await Staff.sync({ force: false, alter: false });
    await Category.sync({ force: false, alter: false });
    
    // Tables that depend on categories
    await Product.sync({ force: false, alter: false });
    
    // Tables that depend on products (IMPORTANT: products must exist first)
    await ProductIngredient.sync({ force: false, alter: false });
    await Inventory.sync({ force: false, alter: false });
    await Review.sync({ force: false, alter: false });
    
    // Tables that depend on users/products
    await Wishlist.sync({ force: false, alter: false });
    await Order.sync({ force: false, alter: false });
    
    // Tables that depend on orders
    await OrderItem.sync({ force: false, alter: false });
    
    // Other tables
    await Feedback.sync({ force: false, alter: false });
    await GuestCart.sync({ force: false, alter: false });
    
    // UI-related tables (no dependencies)
    await HeroSection.sync({ force: false, alter: false });
    await OurProductCollectionCategory.sync({ force: false, alter: false });
    await OurProduct.sync({ force: false, alter: false });
    await Testimonial.sync({ force: false, alter: false });
    await AboutUsTitle.sync({ force: false, alter: false });
    await OurStory.sync({ force: false, alter: false });
    await Mission.sync({ force: false, alter: false });
    await OurValues.sync({ force: false, alter: false });
    await ContactInfo.sync({ force: false, alter: false });
    await ContactForm.sync({ force: false, alter: false });
    await FeaturedDuoVideo.sync({ force: false, alter: false });
    
    // Notification system table
    await Notification.sync({ force: false, alter: false });

    // ── custom_themes table ────────────────────────────────────────────────────
    const { CustomTheme } = await import("../../features/siteTheme/siteThemeModel");
    await CustomTheme.sync({ force: false, alter: false });
    
    // Seed default themes (Gold & Medical Blue) if they don't exist
    const goldExists = await CustomTheme.findOne({ where: { id: "gold" } });
    if (!goldExists) {
      await CustomTheme.create({
        id: "gold",
        name: "Gold & Black",
        isDefault: true,
        primary: "#D4AF37",
        primaryLight: "#ffe87c",
        primaryDark: "#b8952e",
        primaryText: "#000000",
        bgPage: "#F9F9F9",
        bgCard: "#ffffff",
        bgNav: "#000000",
        textHeading: "#1A1A1A",
        textBody: "#374151",
        textMuted: "#6B6B6B",
        borderColor: "#E8E4DC",
        shadow: "0 2px 12px rgba(0,0,0,0.08)",
        shadowHover: "0 8px 28px rgba(0,0,0,0.15)",
      });
      console.log("✅ Gold theme seeded.");
    }
    
    const medicalExists = await CustomTheme.findOne({ where: { id: "medical" } });
    if (!medicalExists) {
      await CustomTheme.create({
        id: "medical",
        name: "Medical Blue",
        isDefault: true,
        primary: "#00B4D8",
        primaryLight: "#90E0EF",
        primaryDark: "#0096C7",
        primaryText: "#ffffff",
        bgPage: "#EAF6FB",
        bgCard: "#ffffff",
        bgNav: "#023E8A",
        textHeading: "#023E8A",
        textBody: "#1a4a6b",
        textMuted: "#4a7a96",
        borderColor: "#CAE9F5",
        shadow: "0 2px 12px rgba(0,100,160,0.10)",
        shadowHover: "0 8px 28px rgba(0,100,160,0.20)",
      });
      console.log("✅ Medical Blue theme seeded.");
    }

    // ── site_theme — singleton config table ───────────────────────────────────
    await SiteTheme.sync({ force: false, alter: false });
    // Seed the singleton row if it doesn't exist
    const themeExists = await q.describeTable("site_theme").catch(() => null);
    if (themeExists) {
      await sequelize.query(`
        INSERT INTO "site_theme" ("id", "activeThemeId", "updatedAt")
        VALUES (1, 'gold', NOW())
        ON CONFLICT ("id") DO NOTHING;
      `);
      console.log("✅ site_theme singleton row ensured.");
    }
    
    console.log("✅ All UI tables verified/created in correct order.");

    // ── 8. Add howToUse and safetyInformation to products if missing ──────────
    const productColsFull = await q.describeTable("products").catch(() => null);
    if (productColsFull) {
      if (!productColsFull["howToUse"]) {
        console.log("➕ Adding howToUse to products...");
        await sequelize.query(`ALTER TABLE "products" ADD COLUMN "howToUse" JSONB NOT NULL DEFAULT '[]';`);
        console.log("✅ products.howToUse added.");
      } else {
        console.log("ℹ️  products.howToUse already exists.");
      }
      if (!productColsFull["safetyInformation"]) {
        console.log("➕ Adding safetyInformation to products...");
        await sequelize.query(`ALTER TABLE "products" ADD COLUMN "safetyInformation" JSONB NOT NULL DEFAULT '[]';`);
        console.log("✅ products.safetyInformation added.");
      } else {
        console.log("ℹ️  products.safetyInformation already exists.");
      }
      if (!productColsFull["productImages"]) {
        console.log("➕ Adding productImages to products...");
        await sequelize.query(`ALTER TABLE "products" ADD COLUMN "productImages" JSONB NOT NULL DEFAULT '[]';`);
        console.log("✅ products.productImages added.");
      } else {
        console.log("ℹ️  products.productImages already exists.");
      }
    }

    // ── 9. Add bgGradient to custom_themes if missing ────────────────────────
    const customThemeColumns = await q.describeTable("custom_themes").catch(() => null);
    if (customThemeColumns) {
      if (!customThemeColumns["bgGradient"]) {
        console.log("➕ Adding bgGradient to custom_themes...");
        await sequelize.query(`ALTER TABLE "custom_themes" ADD COLUMN "bgGradient" TEXT DEFAULT NULL;`);
        console.log("✅ custom_themes.bgGradient added.");
      } else {
        console.log("ℹ️  custom_themes.bgGradient already exists.");
      }

      // Always update default theme gradient values (safe upsert)
      await sequelize.query(`
        UPDATE "custom_themes"
        SET "bgGradient" = 'linear-gradient(160deg, #dff0fb 0%, #eaf6ff 35%, #f4f9fc 65%, #edf5fb 100%)'
        WHERE id = 'gold' AND ("bgGradient" IS NULL OR "bgGradient" = '');
      `);
      await sequelize.query(`
        UPDATE "custom_themes"
        SET "bgGradient" = 'linear-gradient(135deg, #e0f4fb 0%, #f0faff 40%, #e8f5f0 100%)'
        WHERE id = 'medical' AND ("bgGradient" IS NULL OR "bgGradient" = '');
      `);
      console.log("✅ Default themes bgGradient values ensured.");
    }

    // ── 10. Add homeBg to site_theme if missing ──────────────────────────────
    const siteThemeColumns = await q.describeTable("site_theme").catch(() => null);
    if (siteThemeColumns) {
      if (!siteThemeColumns["homeBg"]) {
        console.log("➕ Adding homeBg to site_theme...");
        await sequelize.query(`ALTER TABLE "site_theme" ADD COLUMN "homeBg" VARCHAR(20) NOT NULL DEFAULT 'blue';`);
        console.log("✅ site_theme.homeBg added.");
      } else {
        console.log("ℹ️  site_theme.homeBg already exists.");
      }
    }

    // ── 11. Create ui_featured_duo table if missing ───────────────────────────
    const duoExists = await q.describeTable("ui_featured_duo").catch(() => null);
    if (!duoExists) {
      console.log("➕ Creating ui_featured_duo table...");
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "ui_featured_duo" (
          "id"          INTEGER       NOT NULL DEFAULT 1,
          "eyebrow"     VARCHAR(120)  DEFAULT NULL,
          "heading"     VARCHAR(255)  DEFAULT NULL,
          "shopNowUrl"  VARCHAR(500)  DEFAULT '/pharmacy',
          "leftImage"   VARCHAR(1000) DEFAULT NULL,
          "leftBrand"   VARCHAR(120)  DEFAULT NULL,
          "leftTitle"   VARCHAR(255)  DEFAULT NULL,
          "leftLink"    VARCHAR(500)  DEFAULT '/pharmacy',
          "rightImage"  VARCHAR(1000) DEFAULT NULL,
          "rightBrand"  VARCHAR(120)  DEFAULT NULL,
          "rightTitle"  VARCHAR(255)  DEFAULT NULL,
          "rightLink"   VARCHAR(500)  DEFAULT '/pharmacy',
          "isActive"    BOOLEAN       NOT NULL DEFAULT TRUE,
          "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          PRIMARY KEY ("id")
        );
      `);
      console.log("✅ ui_featured_duo table created.");
    } else {
      console.log("ℹ️  ui_featured_duo already exists.");
    }

    // ── 12. Create promotion_slides table if missing ──────────────────────────
    const promoExists = await q.describeTable("promotion_slides").catch(() => null);
    if (!promoExists) {
      console.log("➕ Creating promotion_slides table...");
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "promotion_slides" (
          "id"          UUID          NOT NULL DEFAULT gen_random_uuid(),
          "eyebrow"     VARCHAR(100)  DEFAULT NULL,
          "brand"       VARCHAR(150)  DEFAULT NULL,
          "title"       VARCHAR(500)  DEFAULT NULL,
          "subtitle"    TEXT          DEFAULT NULL,
          "description" TEXT          DEFAULT NULL,
          "ctaText"     VARCHAR(150)  DEFAULT NULL,
          "ctaLink"     VARCHAR(500)  DEFAULT NULL,
          "bgImage"     VARCHAR(500)  DEFAULT NULL,
          "order"       INTEGER       NOT NULL DEFAULT 0,
          "isActive"    BOOLEAN       NOT NULL DEFAULT TRUE,
          "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          PRIMARY KEY ("id")
        );
      `);
      console.log("✅ promotion_slides table created.");
    } else {
      // Add subtitle column if missing (migration for existing tables)
      const promoColumns = promoExists as Record<string, unknown>;
      if (!promoColumns["subtitle"]) {
        console.log("➕ Adding subtitle column to promotion_slides...");
        await sequelize.query(`ALTER TABLE "promotion_slides" ADD COLUMN IF NOT EXISTS "subtitle" TEXT DEFAULT NULL;`);
        console.log("✅ subtitle column added.");
      }
      // Widen title column if still 200
      await sequelize.query(`ALTER TABLE "promotion_slides" ALTER COLUMN "title" TYPE VARCHAR(500);`).catch(() => null);
      console.log("ℹ️  promotion_slides already exists.");
    }

    // ── 13. Create ui_discover_section table if missing ──────────────────────
    const discoverExists = await q.describeTable("ui_discover_section").catch(() => null);
    if (!discoverExists) {
      console.log("➕ Creating ui_discover_section table...");
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "ui_discover_section" (
          "id"                INTEGER       NOT NULL DEFAULT 1,
          "eyebrow"           VARCHAR(150)  DEFAULT NULL,
          "heading"           VARCHAR(255)  DEFAULT NULL,
          "description"       TEXT          DEFAULT NULL,
          "mainImage"         VARCHAR(1000) DEFAULT NULL,
          "ctaText"           VARCHAR(100)  DEFAULT 'DISCOVER MORE',
          "expandTitle"       VARCHAR(255)  DEFAULT NULL,
          "expandDescription" TEXT          DEFAULT NULL,
          "expandBtn1Text"    VARCHAR(100)  DEFAULT NULL,
          "expandBtn1Link"    VARCHAR(500)  DEFAULT NULL,
          "expandBtn2Text"    VARCHAR(100)  DEFAULT NULL,
          "expandBtn2Link"    VARCHAR(500)  DEFAULT NULL,
          "expandImage"       VARCHAR(1000) DEFAULT NULL,
          "expandImageLabel"  VARCHAR(255)  DEFAULT NULL,
          "diveInto"          VARCHAR(100)  DEFAULT NULL,
          "diveHeading"       VARCHAR(255)  DEFAULT NULL,
          "diveDescription"   TEXT          DEFAULT NULL,
          "videoImage"        VARCHAR(1000) DEFAULT NULL,
          "videoLabel"        VARCHAR(150)  DEFAULT NULL,
          "videoTitle"        VARCHAR(255)  DEFAULT NULL,
          "videoUrl"          VARCHAR(1000) DEFAULT NULL,
          "isActive"          BOOLEAN       NOT NULL DEFAULT TRUE,
          "createdAt"         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          "updatedAt"         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          PRIMARY KEY ("id")
        );
      `);
      console.log("✅ ui_discover_section table created.");
    } else {
      console.log("ℹ️  ui_discover_section already exists.");
    }

    // ── 14. Migrate ui_featured_duo — add video columns, drop old right* cols ──
    const duoCols = await q.describeTable("ui_featured_duo").catch(() => null);
    if (duoCols) {
      if (!duoCols["videoUrl"]) {
        console.log("➕ Adding videoUrl to ui_featured_duo...");
        await sequelize.query(`ALTER TABLE "ui_featured_duo" ADD COLUMN "videoUrl" VARCHAR(1000) DEFAULT NULL;`);
        // Migrate existing rightImage → videoUrl
        await sequelize.query(`UPDATE "ui_featured_duo" SET "videoUrl" = "rightImage" WHERE "rightImage" IS NOT NULL;`);
        console.log("✅ ui_featured_duo.videoUrl added (migrated from rightImage).");
      } else {
        console.log("ℹ️  ui_featured_duo.videoUrl already exists.");
      }
      if (!duoCols["videoBrand"]) {
        console.log("➕ Adding videoBrand to ui_featured_duo...");
        await sequelize.query(`ALTER TABLE "ui_featured_duo" ADD COLUMN "videoBrand" VARCHAR(120) DEFAULT NULL;`);
        await sequelize.query(`UPDATE "ui_featured_duo" SET "videoBrand" = "rightBrand" WHERE "rightBrand" IS NOT NULL;`);
        console.log("✅ ui_featured_duo.videoBrand added.");
      } else {
        console.log("ℹ️  ui_featured_duo.videoBrand already exists.");
      }
      if (!duoCols["videoTitle"]) {
        console.log("➕ Adding videoTitle to ui_featured_duo...");
        await sequelize.query(`ALTER TABLE "ui_featured_duo" ADD COLUMN "videoTitle" VARCHAR(255) DEFAULT NULL;`);
        await sequelize.query(`UPDATE "ui_featured_duo" SET "videoTitle" = "rightTitle" WHERE "rightTitle" IS NOT NULL;`);
        console.log("✅ ui_featured_duo.videoTitle added.");
      } else {
        console.log("ℹ️  ui_featured_duo.videoTitle already exists.");
      }
      if (!duoCols["videoLink"]) {
        console.log("➕ Adding videoLink to ui_featured_duo...");
        await sequelize.query(`ALTER TABLE "ui_featured_duo" ADD COLUMN "videoLink" VARCHAR(500) DEFAULT '/pharmacy';`);
        await sequelize.query(`UPDATE "ui_featured_duo" SET "videoLink" = "rightLink" WHERE "rightLink" IS NOT NULL;`);
        console.log("✅ ui_featured_duo.videoLink added.");
      } else {
        console.log("ℹ️  ui_featured_duo.videoLink already exists.");
      }
      if (!duoCols["videos"]) {
        console.log("➕ Adding videos array to ui_featured_duo...");
        await sequelize.query(`ALTER TABLE "ui_featured_duo" ADD COLUMN "videos" JSONB NOT NULL DEFAULT '[]';`);
        console.log("✅ ui_featured_duo.videos added.");
      } else {
        console.log("ℹ️  ui_featured_duo.videos already exists.");
      }
    }

    // ── 15. Create ui_featured_duo_videos table if missing ───────────────────
    const duoVideosExists = await q.describeTable("ui_featured_duo_videos").catch(() => null);
    if (!duoVideosExists) {
      console.log("➕ Creating ui_featured_duo_videos table...");
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "ui_featured_duo_videos" (
          "id"        UUID          NOT NULL DEFAULT gen_random_uuid(),
          "url"       VARCHAR(1000) NOT NULL,
          "brand"     VARCHAR(120)  DEFAULT NULL,
          "title"     VARCHAR(255)  DEFAULT NULL,
          "link"      VARCHAR(500)  DEFAULT '/pharmacy',
          "sortOrder" INTEGER       NOT NULL DEFAULT 0,
          "isActive"  BOOLEAN       NOT NULL DEFAULT TRUE,
          "createdAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          PRIMARY KEY ("id")
        );
      `);
      console.log("✅ ui_featured_duo_videos table created.");
    } else {
      console.log("ℹ️  ui_featured_duo_videos already exists.");
    }

    // ── 16. Create ui_announcement_messages table if missing ─────────────────
    const announcementExists = await q.describeTable("ui_announcement_messages").catch(() => null);
    if (!announcementExists) {
      console.log("➕ Creating ui_announcement_messages table...");
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "ui_announcement_messages" (
          "id"        UUID          NOT NULL DEFAULT gen_random_uuid(),
          "text"      VARCHAR(500)  NOT NULL,
          "cta"       VARCHAR(100)  DEFAULT NULL,
          "link"      VARCHAR(500)  DEFAULT '/pharmacy',
          "isActive"  BOOLEAN       NOT NULL DEFAULT TRUE,
          "sortOrder" INTEGER       NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          PRIMARY KEY ("id")
        );
      `);
      // Seed the 4 default messages
      await sequelize.query(`
        INSERT INTO "ui_announcement_messages" ("id","text","cta","link","isActive","sortOrder","createdAt","updatedAt") VALUES
          (gen_random_uuid(), 'Seasonal reductions: shop up to 60% off.',           'Shop now',   '/pharmacy', true, 0, NOW(), NOW()),
          (gen_random_uuid(), 'Free next-day UK delivery on orders over £50.',       'Shop now',   '/pharmacy', true, 1, NOW(), NOW()),
          (gen_random_uuid(), 'New arrivals: premium skincare collections just landed.', 'Explore', '/pharmacy', true, 2, NOW(), NOW()),
          (gen_random_uuid(), 'Earn loyalty points on every purchase.',              'Learn more', '/pharmacy', true, 3, NOW(), NOW());
      `);
      console.log("✅ ui_announcement_messages table created and seeded.");
    } else {
      console.log("ℹ️  ui_announcement_messages already exists.");
    }

    // ── 17. users — add OTP columns for auth flows ───────────────────────────
    const userColsNow = await q.describeTable("users");
    if (!userColsNow["otpCode"]) {
      console.log("➕ Adding otpCode to users...");
      await sequelize.query(`ALTER TABLE "users" ADD COLUMN "otpCode" VARCHAR(10) DEFAULT NULL;`);
      console.log("✅ users.otpCode added.");
    } else {
      console.log("ℹ️  users.otpCode already exists.");
    }
    if (!userColsNow["otpExpiry"]) {
      console.log("➕ Adding otpExpiry to users...");
      await sequelize.query(`ALTER TABLE "users" ADD COLUMN "otpExpiry" TIMESTAMPTZ DEFAULT NULL;`);
      console.log("✅ users.otpExpiry added.");
    } else {
      console.log("ℹ️  users.otpExpiry already exists.");
    }
    if (!userColsNow["otpPurpose"]) {
      console.log("➕ Adding otpPurpose to users...");
      await sequelize.query(`ALTER TABLE "users" ADD COLUMN "otpPurpose" VARCHAR(50) DEFAULT NULL;`);
      console.log("✅ users.otpPurpose added.");
    } else {
      console.log("ℹ️  users.otpPurpose already exists.");
    }

    // ── 18. faqs — create table if missing ───────────────────────────────────
    const faqExists = await q.describeTable("faqs").catch(() => null);
    if (!faqExists) {
      console.log("➕ Creating faqs table...");
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "faqs" (
          "id"           UUID          NOT NULL DEFAULT gen_random_uuid(),
          "question"     VARCHAR(500)  NOT NULL,
          "answer"       TEXT          NOT NULL,
          "category"     VARCHAR(100)  DEFAULT NULL,
          "displayOrder" INTEGER       NOT NULL DEFAULT 0,
          "isActive"     BOOLEAN       NOT NULL DEFAULT TRUE,
          "createdAt"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          "updatedAt"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          PRIMARY KEY ("id")
        );
      `);
      // Seed a few default FAQs
      await sequelize.query(`
        INSERT INTO "faqs" ("id","question","answer","category","displayOrder","isActive","createdAt","updatedAt") VALUES
          (gen_random_uuid(), 'What are your pharmacy opening hours?', 'We are open Monday to Saturday from 9:00 AM to 8:00 PM, and Sunday from 10:00 AM to 6:00 PM.', 'General', 1, true, NOW(), NOW()),
          (gen_random_uuid(), 'Do you offer free delivery?', 'Yes, we offer free delivery on all orders over £30. Standard delivery typically arrives within 2-3 working days.', 'Delivery', 2, true, NOW(), NOW()),
          (gen_random_uuid(), 'Can I order prescription medicines online?', 'Yes, we accept valid prescriptions. Simply upload your prescription during checkout and our pharmacist will verify it before dispatch.', 'Prescriptions', 3, true, NOW(), NOW()),
          (gen_random_uuid(), 'How do I track my order?', 'Once your order is dispatched, you will receive a tracking email. You can also track your order anytime from the Track Order page on our website.', 'Ordering', 4, true, NOW(), NOW()),
          (gen_random_uuid(), 'What payment methods do you accept?', 'We accept all major credit and debit cards, PayPal, and cash on delivery for local orders.', 'Ordering', 5, true, NOW(), NOW()),
          (gen_random_uuid(), 'Can I return a product?', 'We accept returns within 14 days for unopened and undamaged products. Please note that prescription medicines cannot be returned for safety reasons.', 'Returns', 6, true, NOW(), NOW());
      `);
      console.log("✅ faqs table created and seeded.");
    } else {
      console.log("ℹ️  faqs table already exists.");
    }

    // ── 19. support_tickets — create table if missing ────────────────────────
    const supportExists = await q.describeTable("support_tickets").catch(() => null);
    if (!supportExists) {
      console.log("➕ Creating support_tickets table...");
      await sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_support_tickets_status" AS ENUM('open','in_progress','resolved','closed');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "support_tickets" (
          "id"             UUID          NOT NULL DEFAULT gen_random_uuid(),
          "ticketNumber"   VARCHAR(20)   NOT NULL UNIQUE,
          "customerId"     UUID          DEFAULT NULL,
          "customerName"   VARCHAR(255)  NOT NULL,
          "customerEmail"  VARCHAR(255)  NOT NULL,
          "customerPhone"  VARCHAR(50)   DEFAULT NULL,
          "subject"        VARCHAR(500)  NOT NULL,
          "category"       VARCHAR(100)  NOT NULL DEFAULT 'General',
          "status"         "enum_support_tickets_status" NOT NULL DEFAULT 'open',
          "message"        TEXT          NOT NULL,
          "assignedTo"     UUID          DEFAULT NULL,
          "adminReply"     TEXT          DEFAULT NULL,
          "resolvedAt"     TIMESTAMPTZ   DEFAULT NULL,
          "closedAt"       TIMESTAMPTZ   DEFAULT NULL,
          "createdAt"      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          "updatedAt"      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          PRIMARY KEY ("id")
        );
        CREATE INDEX idx_support_ticket_number ON "support_tickets" ("ticketNumber");
        CREATE INDEX idx_support_customer_email ON "support_tickets" ("customerEmail");
        CREATE INDEX idx_support_status ON "support_tickets" ("status");
        CREATE INDEX idx_support_category ON "support_tickets" ("category");
        CREATE INDEX idx_support_created ON "support_tickets" ("createdAt");
      `);
      console.log("✅ support_tickets table created.");
    } else {
      console.log("ℹ️  support_tickets table already exists.");
      
      // Update existing table - remove priority, change notes to adminReply
      const supportCols = await q.describeTable("support_tickets");
      if (supportCols["priority"]) {
        console.log("🔄 Updating support_tickets table schema...");
        await sequelize.query(`ALTER TABLE "support_tickets" DROP COLUMN IF EXISTS "priority";`);
        console.log("✅ Removed priority column.");
      }
      if (supportCols["notes"] && !supportCols["adminReply"]) {
        console.log("🔄 Renaming notes to adminReply...");
        await sequelize.query(`ALTER TABLE "support_tickets" RENAME COLUMN "notes" TO "adminReply";`);
        console.log("✅ Renamed notes to adminReply.");
      } else if (!supportCols["adminReply"]) {
        console.log("➕ Adding adminReply column...");
        await sequelize.query(`ALTER TABLE "support_tickets" ADD COLUMN "adminReply" TEXT DEFAULT NULL;`);
        console.log("✅ Added adminReply column.");
      }
    }

    // ── 20. job_postings — create table if missing ───────────────────────────
    const jobsExists = await q.describeTable("job_postings").catch(() => null);
    if (!jobsExists) {
      console.log("➕ Creating job_postings table...");
      await sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_job_postings_employmentType" AS ENUM('full-time','part-time','contract','internship');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "job_postings" (
          "id"               UUID          NOT NULL DEFAULT gen_random_uuid(),
          "title"            VARCHAR(200)  NOT NULL,
          "department"       VARCHAR(100)  NOT NULL,
          "location"         VARCHAR(200)  NOT NULL,
          "employmentType"   "enum_job_postings_employmentType" NOT NULL DEFAULT 'full-time',
          "salaryRange"      VARCHAR(100)  DEFAULT NULL,
          "description"      TEXT          NOT NULL,
          "requirements"     TEXT          NOT NULL,
          "responsibilities" TEXT          NOT NULL,
          "benefits"         TEXT          DEFAULT NULL,
          "applicationEmail" VARCHAR(255)  NOT NULL,
          "isActive"         BOOLEAN       NOT NULL DEFAULT TRUE,
          "displayOrder"     INTEGER       NOT NULL DEFAULT 0,
          "createdAt"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          "updatedAt"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          PRIMARY KEY ("id")
        );
        CREATE INDEX idx_job_active ON "job_postings" ("isActive");
        CREATE INDEX idx_job_department ON "job_postings" ("department");
        CREATE INDEX idx_job_employment ON "job_postings" ("employmentType");
        CREATE INDEX idx_job_order ON "job_postings" ("displayOrder");
      `);
      console.log("✅ job_postings table created.");
    } else {
      console.log("ℹ️  job_postings table already exists.");
    }

    // ── 21. terms_sections — create table if missing ──────────────────────────
    const termsExists = await q.describeTable("terms_sections").catch(() => null);
    if (!termsExists) {
      console.log("➕ Creating terms_sections table...");
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "terms_sections" (
          "id"           UUID          NOT NULL DEFAULT gen_random_uuid(),
          "title"        VARCHAR(200)  NOT NULL,
          "content"      TEXT          NOT NULL,
          "displayOrder" INTEGER       NOT NULL DEFAULT 0,
          "isActive"     BOOLEAN       NOT NULL DEFAULT TRUE,
          "createdAt"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          "updatedAt"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
          PRIMARY KEY ("id")
        );
        CREATE INDEX idx_terms_order ON "terms_sections" ("displayOrder");
        CREATE INDEX idx_terms_active ON "terms_sections" ("isActive");
      `);
      
      // Seed default terms sections
      await sequelize.query(`
        INSERT INTO "terms_sections" ("id","title","content","displayOrder","isActive","createdAt","updatedAt") VALUES
          (gen_random_uuid(), 'Introduction', 'Welcome to Rosewood Pharmacy. These terms and conditions outline the rules and regulations for the use of our website and services. By accessing this website and placing an order, you accept these terms and conditions in full. Do not continue to use Rosewood Pharmacy if you do not accept all of the terms and conditions stated on this page.', 1, true, NOW(), NOW()),
          (gen_random_uuid(), 'License to Use', 'Unless otherwise stated, Rosewood Pharmacy and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved. You may view and/or print pages from our website for your own personal use subject to restrictions set in these terms and conditions.', 2, true, NOW(), NOW()),
          (gen_random_uuid(), 'Product Information', 'We strive to ensure that all product information, including descriptions, images, and pricing, is accurate. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free. If a product offered by us is not as described, your sole remedy is to return it in unused condition.', 3, true, NOW(), NOW()),
          (gen_random_uuid(), 'Prescription Medicines', 'Prescription medicines can only be supplied against a valid UK prescription issued by a qualified healthcare professional. We reserve the right to refuse to dispense any prescription if our pharmacist has concerns about its validity or appropriateness. All prescriptions are subject to verification and approval by our registered pharmacist before dispensing.', 4, true, NOW(), NOW()),
          (gen_random_uuid(), 'Ordering and Payment', 'When you place an order with us, you are making an offer to purchase the products. We reserve the right to accept or decline your order for any reason. Payment must be made in full at the time of ordering. We accept all major credit and debit cards, PayPal, and other payment methods as displayed on our website. All prices are in GBP and include VAT where applicable.', 5, true, NOW(), NOW()),
          (gen_random_uuid(), 'Delivery', 'We aim to dispatch orders within 1-2 working days. Delivery times vary depending on your location and the delivery method selected. Standard delivery typically takes 2-3 working days. We are not responsible for delays caused by courier services or circumstances beyond our control. A signature may be required upon delivery for certain items.', 6, true, NOW(), NOW()),
          (gen_random_uuid(), 'Returns and Refunds', 'You have the right to cancel your order and return products within 14 days of receipt, except for prescription medicines and items with broken hygiene seals. Products must be returned in their original, unopened packaging. Refunds will be processed within 14 days of receiving your returned items. Return shipping costs are the responsibility of the customer unless the product is faulty.', 7, true, NOW(), NOW()),
          (gen_random_uuid(), 'Refund Exclusions', 'Unfortunately, you cannot return medicines, including prescription medicines, or anything that has a hygiene seal or tamper-proof seal that has been broken. Also, no returns can be processed for contraceptive items. You have the right to reasonably inspect your items as you would in a shop, but you cannot return items that you have used, unless you are returning them because they are damaged or faulty.', 8, true, NOW(), NOW()),
          (gen_random_uuid(), 'PayPal Refunds', 'If you have paid for your order by PayPal, you can only return your order by post. PayPal orders cannot be returned to store at this time.', 9, true, NOW(), NOW()),
          (gen_random_uuid(), 'Liability', 'Our maximum liability for our failure to fulfil an order that we are legally bound to fulfil will be limited to the price paid by you for that order. We are not liable for any indirect, consequential, or special damages arising from your use of our products or services.', 10, true, NOW(), NOW()),
          (gen_random_uuid(), 'Privacy and Data Protection', 'We are committed to protecting your privacy and personal data in accordance with the UK Data Protection Act 2018 and GDPR. Please refer to our Privacy Policy for detailed information on how we collect, use, and protect your personal information.', 11, true, NOW(), NOW()),
          (gen_random_uuid(), 'Changes to Terms', 'We reserve the right to modify these terms and conditions at any time. Changes will be effective immediately upon posting on our website. Your continued use of our website and services following any changes constitutes acceptance of those changes.', 12, true, NOW(), NOW()),
          (gen_random_uuid(), 'Governing Law', 'These terms and conditions are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.', 13, true, NOW(), NOW()),
          (gen_random_uuid(), 'Contact Information', 'If you have any questions about these Terms and Conditions, please contact us at: Email: legal@rosewoodpharmacy.co.uk, Phone: +44 (0)20 7935 5555, Address: 26 Wigmore Street, London W1U 2RH', 14, true, NOW(), NOW());
      `);
      console.log("✅ terms_sections table created and seeded.");
    } else {
      console.log("ℹ️  terms_sections table already exists.");
    }

    console.log("\n🎉 Migration complete.");

    // ── Make originalPrice nullable (optional MRP field) ─────────────────────
    const productColsForPrice = await q.describeTable("products").catch(() => null);
    if (productColsForPrice && productColsForPrice["originalPrice"]) {
      const col = productColsForPrice["originalPrice"] as { allowNull?: boolean };
      if (col.allowNull === false) {
        console.log("🔧 Making products.originalPrice nullable (optional MRP)...");
        await sequelize.query(`
          ALTER TABLE "products"
          ALTER COLUMN "originalPrice" DROP NOT NULL,
          ALTER COLUMN "originalPrice" SET DEFAULT NULL;
        `);
        console.log("✅ products.originalPrice is now nullable.");
      } else {
        console.log("ℹ️  products.originalPrice already nullable.");
      }
    }

    // ── Add deliveryToken + deliveryTokenUsed to orders ───────────────────────
    const orderColsForToken = await q.describeTable("orders").catch(() => null);
    if (orderColsForToken) {
      if (!orderColsForToken["deliveryToken"]) {
        console.log("➕ Adding deliveryToken to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "deliveryToken" VARCHAR(64) DEFAULT NULL UNIQUE;`);
        console.log("✅ orders.deliveryToken added.");
      } else {
        console.log("ℹ️  orders.deliveryToken already exists.");
      }
      if (!orderColsForToken["deliveryTokenUsed"]) {
        console.log("➕ Adding deliveryTokenUsed to orders...");
        await sequelize.query(`ALTER TABLE "orders" ADD COLUMN "deliveryTokenUsed" BOOLEAN NOT NULL DEFAULT FALSE;`);
        console.log("✅ orders.deliveryTokenUsed added.");
      } else {
        console.log("ℹ️  orders.deliveryTokenUsed already exists.");
      }
    }

    console.log("\n🎉 Migration complete.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
