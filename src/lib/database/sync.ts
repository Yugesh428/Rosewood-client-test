import sequelize from "./sequelize";

// ── Core models ───────────────────────────────────────────────────────────────
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

// ── UI — Hero Section ─────────────────────────────────────────────────────────
import HeroSection from "../../features/Ui/HeroSection/heroModel/heroModel";

// ── UI — Our Product Collection ───────────────────────────────────────────────
import OurProductCollectionCategory from "../../features/Ui/ourProductCollection/ourProductCollectionCategoryModel";
import OurProduct from "../../features/Ui/ourProductCollection/ourProductContent/ourProductModel";

// ── UI — Testimonials ─────────────────────────────────────────────────────────
import Testimonial from "../../features/Ui/testimonials/testimonialsModel";

// ── UI — About Us Page ────────────────────────────────────────────────────────
import AboutUsTitle from "../../features/Ui/AboutUsPage/AboutUs Head/aboutUsTitleModel";
import OurStory from "../../features/Ui/AboutUsPage/ourStory/ourStroyModel";
import Mission from "../../features/Ui/AboutUsPage/ourMisson/missionModel";
import OurValues from "../../features/Ui/AboutUsPage/ourValues/ourValuesModel";

// ── UI — Contact ──────────────────────────────────────────────────────────────
import ContactInfo from "../../features/Ui/contact/contactInfo/contactInfoModel";
import ContactForm from "../../features/Ui/contact/contactForm/contactFormModel";

// ── Site Theme ────────────────────────────────────────────────────────────────
import SiteTheme from "../../features/siteTheme/siteThemeModel";

async function sync() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    // Sync models in explicit order to respect foreign key dependencies
    // 1. Independent tables (no foreign keys)
    await User.sync({ force: false, alter: false });
    await Staff.sync({ force: false, alter: false });
    await Category.sync({ force: false, alter: false });
    
    // 2. Tables that depend on categories
    await Product.sync({ force: false, alter: false });
    
    // 3. Tables that depend on products
    await ProductIngredient.sync({ force: false, alter: false });
    await Inventory.sync({ force: false, alter: false });
    await Review.sync({ force: false, alter: false });
    
    // 4. Tables that depend on users/products
    await Wishlist.sync({ force: false, alter: false });
    await Order.sync({ force: false, alter: false });
    
    // 5. Tables that depend on orders
    await OrderItem.sync({ force: false, alter: false });
    
    // 6. Other tables
    await Feedback.sync({ force: false, alter: false });
    await GuestCart.sync({ force: false, alter: false });
    
    // 7. UI-related tables (no dependencies)
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
    await SiteTheme.sync({ force: false, alter: false });
    
    console.log("✅ All models synced successfully in correct order.");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

sync();
