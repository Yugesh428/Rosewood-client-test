/**
 * Fresh Seed - Drop, recreate, and seed categories & products
 */

import { execSync } from "child_process";

console.log("🔄 Starting fresh seed process...\n");

try {
  // Step 1: Reset tables
  console.log("Step 1: Resetting tables...");
  execSync("npx tsx --env-file=.env --tsconfig tsconfig.scripts.json scripts/reset-categories-products.ts", { 
    stdio: "inherit",
    cwd: process.cwd()
  });

  // Step 2: Seed data
  console.log("\nStep 2: Seeding data...");
  execSync("npx tsx --env-file=.env --tsconfig tsconfig.scripts.json scripts/seed-nested-categories.ts", { 
    stdio: "inherit",
    cwd: process.cwd()
  });

  console.log("\n✅ Fresh seed completed successfully!");
} catch (error) {
  console.error("\n❌ Fresh seed failed:", error);
  process.exit(1);
}
