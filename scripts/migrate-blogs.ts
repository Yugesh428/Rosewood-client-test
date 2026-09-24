/**
 * Migration script to create blogs table
 * Usage: npx tsx scripts/migrate-blogs.ts
 */

import sequelize from "../src/lib/database/sequelize";
import Blog from "../src/features/Ui/blog/blogModel";

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected.");

    // Create blogs table
    await Blog.sync({ force: false, alter: true });
    console.log("✅ Blogs table created/updated successfully!");

    console.log("\n📋 Table structure:");
    console.log("  - id (UUID, Primary Key)");
    console.log("  - title (String, Required)");
    console.log("  - slug (String, Unique, Required)");
    console.log("  - category (String, Required)");
    console.log("  - excerpt (Text, Required)");
    console.log("  - content (Text/HTML, Required)");
    console.log("  - coverImage (String, Required)");
    console.log("  - authorName (String, Default: 'Prakriti Team')");
    console.log("  - authorRole (String, Default: 'Author')");
    console.log("  - date (String, Required)");
    console.log("  - isPublished (Boolean, Default: false)");
    console.log("  - isFeatured (Boolean, Default: false)");
    console.log("  - displayOrder (Integer, Default: 0)");
    console.log("  - createdAt (Timestamp)");
    console.log("  - updatedAt (Timestamp)");

    console.log("\n💡 Next steps:");
    console.log("  1. Run: npx tsx scripts/seed-blogs.ts (to add sample data)");
    console.log("  2. Visit: http://localhost:3000/admin/blogs (to manage blogs)");
    console.log("  3. Visit: http://localhost:3000/articles (to view public blog listing)");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
