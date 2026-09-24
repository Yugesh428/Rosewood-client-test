import sequelize from "../src/lib/database/sequelize";
import Category from "../src/features/productCategory/productCatetgoryModel";

async function checkCategories() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Get all categories
    const allCategories = await Category.findAll({
      attributes: ["id", "categoryName", "parentId", "isActive"],
      order: [["categoryName", "ASC"]],
    });

    console.log(`📊 Total categories: ${allCategories.length}\n`);

    // Find Skincare category
    const skincare = allCategories.find(c => c.categoryName === "Skincare");
    if (skincare) {
      console.log("✅ Skincare category found:");
      console.log(`   ID: ${skincare.id}`);
      console.log(`   Active: ${skincare.isActive}`);
      console.log(`   Parent ID: ${skincare.parentId}\n`);
      
      // Find its subcategories
      const subCats = allCategories.filter(c => c.parentId === skincare.id);
      console.log(`   Subcategories (${subCats.length}):`);
      subCats.forEach(sub => {
        console.log(`     - ${sub.categoryName} (${sub.isActive ? 'active' : 'inactive'})`);
      });
    } else {
      console.log("❌ Skincare category NOT found");
    }

    console.log("\n📋 All top-level categories:");
    const topLevel = allCategories.filter(c => c.parentId === null);
    topLevel.forEach(cat => {
      const subCount = allCategories.filter(c => c.parentId === cat.id).length;
      console.log(`   - ${cat.categoryName} (${subCount} subcategories, ${cat.isActive ? 'active' : 'inactive'})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkCategories();
