/**
 * Add subcategories to Antacids and seed products for them
 */

import sequelize from "../src/lib/database/sequelize";
import Category from "../src/features/productCategory/productCatetgoryModel";
import Product from "../src/features/products/productModel";

async function seedAntacidsSubcategories() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Find Antacids category
    const antacids = await Category.findOne({ where: { categoryName: "Antacids" } });
    if (!antacids) {
      console.log("❌ Antacids category not found. Run fresh:seed first.");
      process.exit(1);
    }
    console.log(`✅ Found Antacids: ${antacids.id}`);

    // Create subcategories under Antacids
    const subcategories = [
      { name: "Liquid Antacids",       description: "Fast-acting liquid antacid formulas for immediate relief" },
      { name: "Chewable Tablets",      description: "Convenient chewable antacid tablets for on-the-go relief" },
      { name: "Effervescent Tablets",  description: "Effervescent antacid tablets that dissolve in water" },
      { name: "Antacid Capsules",      description: "Easy-to-swallow antacid capsules for heartburn relief" },
    ];

    for (const sub of subcategories) {
      const subCat = await Category.create({
        categoryName: sub.name,
        categoryDescription: sub.description,
        isActive: true,
        parentId: antacids.id,
      });
      console.log(`  ✅ Created: ${subCat.categoryName}`);

      // Add 4-5 products to each subcategory
      const count = Math.floor(Math.random() * 2) + 4;
      const suitableOptions = [["adults"], ["children", "adults"], ["elderly", "adults"], ["adults", "vegan"]];

      for (let i = 1; i <= count; i++) {
        const base = Math.floor(Math.random() * 20) + 8;
        const disc = Math.random() > 0.6 ? Math.floor(Math.random() * 20) + 10 : 0;
        const sell = disc > 0 ? base * (1 - disc / 100) : base;

        await Product.create({
          categoryId: subCat.id,
          productName: `${sub.name} Formula ${i}`,
          productImage: null,
          productImages: [],
          dosageForm: ["Liquid", "Tablet", "Capsule"][Math.floor(Math.random() * 3)],
          strength: ["200mg", "400mg", "500mg"][Math.floor(Math.random() * 3)],
          packSize: [`${Math.floor(Math.random() * 200) + 50}ml`, `${Math.floor(Math.random() * 30) + 10} tablets`][Math.floor(Math.random() * 2)],
          unitType: ["bottle", "box", "pack"][Math.floor(Math.random() * 3)],
          sellingPrice: Number(sell.toFixed(2)),
          originalPrice: base,
          tax: 0,
          discount: disc,
          productDescriptions: [
            { title: "Description", content: `${sub.description}. Clinically tested formula for fast, effective relief.` },
            { title: "How to Use", content: "Take as directed on the label. Consult your doctor if symptoms persist." },
          ],
          specifications: [
            { key: "Brand", value: "Rosewood Premium" },
            { key: "Made In", value: "UK" },
          ],
          suitableFor: suitableOptions[Math.floor(Math.random() * suitableOptions.length)],
          howToUse: ["Read label before use", "Take recommended dose", "Do not exceed daily limit"],
          safetyInformation: ["Consult doctor if pregnant", "Keep out of reach of children"],
          isActive: true,
        });
      }
      console.log(`     ✓ ${count} products added`);
    }

    const total = await Product.count({ where: { categoryId: antacids.id } });
    console.log(`\n🎉 Done! Antacids now has ${subcategories.length} subcategories`);
    console.log(`🔗 Visit: http://localhost:3000/pharmacy/category/${antacids.id}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedAntacidsSubcategories();
