/**
 * Migration script — run once to apply schema changes safely.
 * Run: npm run db:migrate
 */

import sequelize from "./sequelize";
import "../models/userModel";
import "../../features/productCategory/productCatetgoryModel";
import "../../features/products/productModel";
import "../../features/products/productIngredientModel";
import "../../features/inventory/inventoryModel";
import "../../features/orders/orderModel";
import "../../features/orderItems/orderItemModel";
import "../../features/staff/staffModel";
import "../../features/wishlist/wishlistModel";
import "../../features/reviews/reviewModel";
import "../../features/feedback/feedbackModel";
import "../../features/guestCart/guestCartModel";

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

    // ── 2. users — add isActive if missing ────────────────────────────────────
    const userColumns = await q.describeTable("users");
    if (!userColumns["isActive"]) {
      console.log("➕ Adding isActive to users...");
      await sequelize.query(`ALTER TABLE "users" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT TRUE;`);
      console.log("✅ users.isActive added.");
    } else {
      console.log("ℹ️  users.isActive already exists.");
    }

    // ── 3. products — add new columns if missing ──────────────────────────────
    const productColumns = await q.describeTable("products").catch(() => null);

    if (!productColumns) {
      console.log("➕ Creating products table from scratch...");
      await sequelize.sync({ force: false, alter: false });
      console.log("✅ products table created.");
    } else {
      // specifications column
      if (!productColumns["specifications"]) {
        console.log("➕ Adding specifications to products...");
        await sequelize.query(`ALTER TABLE "products" ADD COLUMN "specifications" JSONB NOT NULL DEFAULT '[]';`);
        console.log("✅ products.specifications added.");
      } else {
        console.log("ℹ️  products.specifications already exists.");
      }

      // suitableFor column
      if (!productColumns["suitableFor"]) {
        console.log("➕ Adding suitableFor to products...");
        await sequelize.query(`ALTER TABLE "products" ADD COLUMN "suitableFor" JSONB NOT NULL DEFAULT '[]';`);
        console.log("✅ products.suitableFor added.");
      } else {
        console.log("ℹ️  products.suitableFor already exists.");
      }
    }

    // ── 4. orders — add guest order columns if missing ────────────────────────
    const orderColumns = await q.describeTable("orders").catch(() => null);
    if (orderColumns) {
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

      // Make customerId nullable for guest orders
      const customerIdCol = orderColumns["customerId"] as { allowNull?: boolean } | undefined;
      if (customerIdCol && customerIdCol.allowNull === false) {
        console.log("🔧 Making orders.customerId nullable for guest orders...");
        await sequelize.query(`ALTER TABLE "orders" ALTER COLUMN "customerId" DROP NOT NULL;`);
        console.log("✅ orders.customerId is now nullable.");
      } else {
        console.log("ℹ️  orders.customerId already nullable.");
      }
    }

    // ── 5. Create any missing tables ──────────────────────────────────────────
    await sequelize.sync({ force: false, alter: false });
    console.log("✅ All tables verified/created.");

    console.log("\n🎉 Migration complete.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
