/**
 * Reset Categories and Products Tables
 * Drops both tables and recreates them with fresh data
 */

import sequelize from "../src/lib/database/sequelize";
import Category from "../src/features/productCategory/productCatetgoryModel";
import Product from "../src/features/products/productModel";

async function resetTables() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Drop tables in correct order (products first due to foreign key)
    console.log("🗑️  Dropping products table...");
    await sequelize.query('DROP TABLE IF EXISTS "products" CASCADE;');
    console.log("✅ Products table dropped\n");

    console.log("🗑️  Dropping categories table...");
    await sequelize.query('DROP TABLE IF EXISTS "categories" CASCADE;');
    console.log("✅ Categories table dropped\n");

    // Recreate tables
    console.log("📦 Creating categories table...");
    await Category.sync({ force: true });
    console.log("✅ Categories table created\n");

    console.log("📦 Creating products table...");
    await Product.sync({ force: true });
    console.log("✅ Products table created\n");

    console.log("🎉 Tables reset successfully!");
    console.log("\n📝 Next step: Run the seed script");
    console.log("   npm run seed:nested-categories\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

resetTables();
