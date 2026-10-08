/**
 * Seed script for nested category structure
 * Creates: 8 main categories → each with 4-6 subcategories → products
 */

import sequelize from "../src/lib/database/sequelize";
import Category from "../src/features/productCategory/productCatetgoryModel";
import Product from "../src/features/products/productModel";

async function seedNestedCategories() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // ── Define 8 Main Categories with their subcategories ──
    const categoryStructure = [
      {
        name: "Skincare",
        description: "Complete range of skincare products for all skin types and concerns",
        subcategories: ["Cleansers", "Moisturizers", "Serums", "Face Masks", "Toners", "Eye Care"],
      },
      {
        name: "Hair Care",
        description: "Professional hair care products for healthy, beautiful hair",
        subcategories: ["Shampoos", "Conditioners", "Hair Treatments", "Styling Products", "Hair Color"],
      },
      {
        name: "Vitamins & Supplements",
        description: "Essential vitamins and nutritional supplements for optimal health",
        subcategories: ["Multivitamins", "Vitamin D", "Omega-3", "Probiotics", "Minerals", "Herbal Supplements"],
      },
      {
        name: "Pain Relief",
        description: "Effective pain relief solutions for various conditions",
        subcategories: ["Headache Relief", "Joint & Muscle Pain", "Back Pain", "Period Pain", "Topical Pain Relief"],
      },
      {
        name: "Cold & Flu",
        description: "Relief from cold and flu symptoms",
        subcategories: ["Cough Medicine", "Decongestants", "Throat Lozenges", "Flu Remedies", "Nasal Sprays"],
      },
      {
        name: "Digestive Health",
        description: "Products for digestive wellness and gut health",
        subcategories: ["Antacids", "Probiotics", "Laxatives", "Anti-Diarrheal", "IBS Relief", "Fiber Supplements"],
      },
      {
        name: "Baby & Mother",
        description: "Essential care products for mothers and babies",
        subcategories: ["Baby Skincare", "Nappies & Wipes", "Baby Food", "Pregnancy Care", "Nursing Products"],
      },
      {
        name: "First Aid",
        description: "First aid essentials for everyday health emergencies",
        subcategories: ["Bandages & Plasters", "Antiseptics", "Wound Care", "Pain Relief Spray", "First Aid Kits"],
      },
    ];

    console.log(`\n📦 Creating ${categoryStructure.length} main categories...\n`);

    for (const mainCat of categoryStructure) {
      // Create main category
      const parent = await Category.create({
        categoryName: mainCat.name,
        categoryDescription: mainCat.description,
        isActive: true,
        parentId: null,
      });
      console.log(`✅ Created: ${parent.categoryName}`);

      // Create subcategories
      for (const subName of mainCat.subcategories) {
        const subCat = await Category.create({
          categoryName: subName,
          categoryDescription: `High-quality ${subName.toLowerCase()} for your needs`,
          isActive: true,
          parentId: parent.id,
        });
        console.log(`  └─ ${subCat.categoryName}`);

        // Create 4-6 products for each subcategory
        const productCount = Math.floor(Math.random() * 3) + 4; // 4-6 products
        const suitableOptions = [
          ["adults", "vegan", "cruelty_free"],
          ["children", "sensitive_skin"],
          ["elderly", "diabetic_friendly"],
          ["pregnant_women", "lactose_free"],
          ["adults", "gluten_free", "vegan"],
          ["children", "adults"],
        ];

        for (let i = 1; i <= productCount; i++) {
          const basePrice = Math.floor(Math.random() * 40) + 10; // £10-£50
          const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 25) + 10 : 0; // 10-35% or 0
          const sellingPrice = discount > 0 ? basePrice * (1 - discount / 100) : basePrice;

          await Product.create({
            categoryId: subCat.id,
            productName: `${subName} Premium Formula ${i}`,
            productImage: null, // Will use placeholder
            productImages: [],
            dosageForm: ["Tablet", "Capsule", "Liquid", "Cream", "Spray", "Topical"][Math.floor(Math.random() * 6)],
            strength: ["50mg", "100mg", "200mg", "500mg", "N/A"][Math.floor(Math.random() * 5)],
            packSize: [`${Math.floor(Math.random() * 100) + 30}ml`, `${Math.floor(Math.random() * 50) + 10} units`][Math.floor(Math.random() * 2)],
            unitType: ["bottle", "box", "tube", "pack"][Math.floor(Math.random() * 4)],
            sellingPrice: Number(sellingPrice.toFixed(2)),
            originalPrice: basePrice,
            tax: 0,
            discount: discount,
            productDescriptions: [
              {
                title: "Description",
                content: `Premium ${subName.toLowerCase()} product designed for ${mainCat.name.toLowerCase()}. Clinically tested and proven effective.`,
              },
              {
                title: "How to Use",
                content: "Follow the instructions on the package. Use as directed by your healthcare professional.",
              },
              {
                title: "Benefits",
                content: "Fast-acting formula with long-lasting results. Suitable for daily use.",
              },
            ],
            specifications: [
              { key: "Brand", value: "Rosewood Premium" },
              { key: "Made In", value: "UK" },
              { key: "Certification", value: "FDA Approved" },
            ],
            suitableFor: suitableOptions[Math.floor(Math.random() * suitableOptions.length)],
            howToUse: [
              "Read the label carefully before use",
              "Follow recommended dosage",
              "Store in a cool, dry place",
              "Keep out of reach of children",
            ],
            safetyInformation: [
              "For external/internal use only as directed",
              "Consult a doctor if symptoms persist",
              "Do not exceed recommended dose",
              "Keep away from direct sunlight",
            ],
            isActive: true,
          });
        }
        console.log(`     ✓ ${productCount} products added`);
      }
      console.log("");
    }

    // Count totals
    const totalCategories = await Category.count();
    const totalProducts = await Product.count();
    const mainCategories = await Category.count({ where: { parentId: null } });

    console.log("🎉 Seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   Main Categories: ${mainCategories}`);
    console.log(`   Total Categories: ${totalCategories}`);
    console.log(`   Total Products: ${totalProducts}`);
    console.log(`\n🔗 Visit any category at: http://localhost:3000/pharmacy\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedNestedCategories();
