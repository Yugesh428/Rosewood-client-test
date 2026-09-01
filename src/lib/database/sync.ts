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

async function sync() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    // force: false, alter: false — only creates tables that don't exist yet
    await sequelize.sync({ force: false, alter: false });
    console.log("✅ All models synced successfully.");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

sync();
