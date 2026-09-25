/**
 * Seed script for product reviews
 * Usage: npx tsx scripts/seed-reviews.ts
 */

import sequelize from "../src/lib/database/sequelize";
import Review from "../src/features/reviews/reviewModel";
import Product from "../src/features/products/productModel";
import User from "../src/lib/models/userModel";
import { Op } from "sequelize";

const sampleReviews = [
  {
    rating: 5,
    reviewText: "Absolutely love this product! It works wonders and the quality is exceptional. Highly recommend to anyone looking for effective results.",
    isVerifiedPurchase: true,
    isApproved: true,
  },
  {
    rating: 4,
    reviewText: "Great product overall. Does what it promises and I've seen noticeable improvements. Only giving 4 stars because the packaging could be better.",
    isVerifiedPurchase: true,
    isApproved: true,
  },
  {
    rating: 5,
    reviewText: "This has become a staple in my daily routine. The results are amazing and it's worth every penny. Will definitely repurchase!",
    isVerifiedPurchase: true,
    isApproved: true,
  },
  {
    rating: 4,
    reviewText: "Very satisfied with this purchase. The product quality is excellent and delivery was fast. Good value for money.",
    isVerifiedPurchase: false,
    isApproved: true,
  },
  {
    rating: 5,
    reviewText: "Exceeded my expectations! I've tried many similar products but this one stands out. My skin feels so much better after using it.",
    isVerifiedPurchase: true,
    isApproved: true,
  },
  {
    rating: 3,
    reviewText: "It's okay, does the job but nothing extraordinary. Works as described but I was expecting more noticeable results.",
    isVerifiedPurchase: true,
    isApproved: true,
  },
  {
    rating: 5,
    reviewText: "Perfect! This is exactly what I was looking for. The quality is top-notch and I can see visible improvements. Highly recommend!",
    isVerifiedPurchase: true,
    isApproved: true,
  },
  {
    rating: 4,
    reviewText: "Really good product. I've been using it for a few weeks now and I'm happy with the results. Would buy again.",
    isVerifiedPurchase: true,
    isApproved: true,
  },
  {
    rating: 5,
    reviewText: "Outstanding quality! This product has made such a difference. I can't imagine my routine without it now. Best purchase I've made!",
    isVerifiedPurchase: true,
    isApproved: true,
  },
  {
    rating: 4,
    reviewText: "Good product, lives up to the description. Noticed positive changes after regular use. Would recommend to friends.",
    isVerifiedPurchase: false,
    isApproved: true,
  },
];

async function seedReviews() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected.");

    // Sync Review table
    await Review.sync({ force: false });
    console.log("✅ Review table ready.");

    // Get specific product: Antacid Capsules Formula 1
    const products = await Product.findAll({
      where: { 
        isActive: true,
        productName: { [Op.like]: '%Antacid%Capsules%Formula%1%' }
      },
      limit: 1,
    });

    if (products.length === 0) {
      console.log("❌ Antacid Capsules Formula 1 not found. Trying to get any active products...");
      const anyProducts = await Product.findAll({
        where: { isActive: true },
        limit: 5,
        order: [["createdAt", "ASC"]],
      });
      products.push(...anyProducts);
    }

    if (products.length === 0) {
      console.log("❌ No products found. Please seed products first.");
      return;
    }

    console.log(`📦 Found ${products.length} products to review.`);

    // Get all customers (users with CUSTOMER role)
    const customers = await User.findAll({
      where: { role: "CUSTOMER" },
      limit: 10,
    });

    if (customers.length === 0) {
      console.log("❌ No customers found. Please create customer accounts first.");
      return;
    }

    console.log(`👥 Found ${customers.length} customers.`);

    // Create reviews from as many unique customers as possible (up to 8 customers)
    let reviewCount = 0;
    let reviewIndex = 0;

    for (const product of products) {
      const reviewsPerProduct = Math.min(8, customers.length); // Try to get 8 reviews, or max available customers
      
      for (let i = 0; i < reviewsPerProduct && i < customers.length; i++) {
        const customer = customers[i];
        const reviewData = sampleReviews[reviewIndex % sampleReviews.length];

        try {
          // Check if review already exists
          const existingReview = await Review.findOne({
            where: {
              customerId: customer.id,
              productId: product.id,
            },
          });

          if (!existingReview) {
            await Review.create({
              customerId: customer.id,
              productId: product.id,
              rating: reviewData.rating,
              reviewText: reviewData.reviewText,
              isVerifiedPurchase: reviewData.isVerifiedPurchase,
              isApproved: reviewData.isApproved,
            });

            console.log(
              `✅ Created ${reviewData.rating}⭐ review for "${product.productName}" by ${customer.name}`
            );
            reviewCount++;
          } else {
            console.log(
              `⏭️  Skipped - Review already exists for "${product.productName}" by ${customer.name}`
            );
          }
        } catch (error: any) {
          if (error?.name === "SequelizeUniqueConstraintError") {
            console.log(
              `⏭️  Skipped - Duplicate review for "${product.productName}" by ${customer.name}`
            );
          } else {
            throw error;
          }
        }

        reviewIndex++;
      }
    }

    console.log(`\n✅ Seeded ${reviewCount} reviews successfully!`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedReviews();
