/**
 * Seed script for Blog Categories and Sample Blogs
 * Run: npm run seed:blogs
 */

import sequelize from "./sequelize";
import BlogCategory from "../../features/Ui/blog/blogCategoryModel";
import Blog from "../../features/Ui/blog/blogModel";

async function seedBlogs() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected.");
    console.log("🌱 Seeding blog categories and sample blogs...\n");

    // Clear existing data
    await Blog.destroy({ where: {} });
    await BlogCategory.destroy({ where: {} });

    // Seed Blog Categories
    const categories = await BlogCategory.bulkCreate([
      {
        name: "Skin Care",
        slug: "skin-care",
        description: "Tips and guides for healthy, glowing skin",
        displayOrder: 1,
        isActive: true,
      },
      {
        name: "Wellness",
        slug: "wellness",
        description: "Holistic health and wellness articles",
        displayOrder: 2,
        isActive: true,
      },
      {
        name: "Gifting",
        slug: "gifting",
        description: "Perfect gift ideas for your loved ones",
        displayOrder: 3,
        isActive: true,
      },
      {
        name: "Royal Jelly",
        slug: "royal-jelly",
        description: "The benefits and uses of royal jelly",
        displayOrder: 4,
        isActive: true,
      },
      {
        name: "Seasonal",
        slug: "seasonal",
        description: "Seasonal skincare and wellness tips",
        displayOrder: 5,
        isActive: true,
      },
      {
        name: "Lifestyle",
        slug: "lifestyle",
        description: "Healthy living and lifestyle tips",
        displayOrder: 6,
        isActive: true,
      },
    ]);

    console.log(`✅ Created ${categories.length} blog categories`);

    // Seed Sample Blogs
    const blogs = await Blog.bulkCreate([
      {
        title: "10 Essential Tips for Radiant Winter Skin",
        slug: "10-essential-tips-radiant-winter-skin",
        category: "Skin Care",
        excerpt: "Discover the secrets to maintaining healthy, glowing skin during the harsh winter months with these expert-recommended tips.",
        content: `
          <h2>Introduction</h2>
          <p>Winter can be harsh on your skin, causing dryness, irritation, and a dull complexion. But with the right care routine, you can maintain radiant, healthy skin all season long.</p>
          
          <h2>1. Hydrate from Within</h2>
          <p>Drinking plenty of water is crucial for maintaining skin hydration. Aim for at least 8 glasses of water daily, even when it's cold outside.</p>
          
          <h2>2. Use a Gentle Cleanser</h2>
          <p>Switch to a cream-based or oil-based cleanser that won't strip your skin of its natural oils. Avoid harsh soaps and hot water.</p>
          
          <h2>3. Layer Your Moisturizer</h2>
          <p>Apply a hydrating serum followed by a rich moisturizer to lock in moisture. Look for ingredients like hyaluronic acid, ceramides, and natural oils.</p>
          
          <h2>4. Don't Skip Sunscreen</h2>
          <p>UV rays can damage your skin even in winter. Apply a broad-spectrum SPF 30+ sunscreen daily, especially if you're out in the snow.</p>
          
          <h2>5. Use a Humidifier</h2>
          <p>Indoor heating systems can dry out the air. A humidifier adds moisture back into the air, helping your skin stay hydrated.</p>
          
          <h2>Conclusion</h2>
          <p>By following these tips and using quality skincare products, you can keep your skin healthy, radiant, and protected throughout the winter season.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200",
        authorName: "Dr. Sarah Johnson",
        authorRole: "Dermatologist",
        date: "15 December 2025",
        isPublished: true,
        isFeatured: true,
        displayOrder: 1,
      },
      {
        title: "The Amazing Benefits of Royal Jelly for Your Skin",
        slug: "amazing-benefits-royal-jelly-skin",
        category: "Royal Jelly",
        excerpt: "Learn why royal jelly has been a beauty secret for centuries and how it can transform your skincare routine.",
        content: `
          <h2>What is Royal Jelly?</h2>
          <p>Royal jelly is a nutrient-rich secretion produced by honey bees to feed queen bee larvae. It's packed with vitamins, minerals, amino acids, and antioxidants that offer remarkable benefits for skin health.</p>
          
          <h2>Key Benefits for Skin</h2>
          
          <h3>1. Anti-Aging Properties</h3>
          <p>Royal jelly contains antioxidants that fight free radicals, helping to reduce fine lines and wrinkles while promoting collagen production.</p>
          
          <h3>2. Deep Hydration</h3>
          <p>The natural humectant properties of royal jelly help your skin retain moisture, keeping it soft and supple.</p>
          
          <h3>3. Healing and Repair</h3>
          <p>Rich in amino acids and vitamins, royal jelly accelerates skin cell regeneration and helps heal damaged skin.</p>
          
          <h3>4. Antibacterial Action</h3>
          <p>Natural antibacterial properties make royal jelly effective in treating acne and preventing breakouts.</p>
          
          <h2>How to Use Royal Jelly</h2>
          <ul>
            <li>Look for skincare products containing royal jelly extract</li>
            <li>Apply royal jelly masks once or twice weekly</li>
            <li>Use royal jelly serums for targeted treatment</li>
            <li>Consider oral supplements for whole-body benefits</li>
          </ul>
          
          <h2>Conclusion</h2>
          <p>Royal jelly is a powerful natural ingredient that can elevate your skincare routine. Its multiple benefits make it suitable for all skin types and ages.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200",
        authorName: "Emma Williams",
        authorRole: "Beauty Expert",
        date: "28 November 2025",
        isPublished: true,
        isFeatured: true,
        displayOrder: 2,
      },
      {
        title: "5 Wellness Habits to Start Your Day Right",
        slug: "5-wellness-habits-start-day-right",
        category: "Wellness",
        excerpt: "Transform your mornings with these simple yet powerful wellness habits that set the tone for a productive and healthy day.",
        content: `
          <h2>The Power of Morning Routines</h2>
          <p>How you start your day often determines how the rest of it unfolds. These five wellness habits can help you feel energized, focused, and ready to tackle whatever comes your way.</p>
          
          <h2>1. Drink Water First Thing</h2>
          <p>Before reaching for coffee, drink a glass of warm water with lemon. This rehydrates your body after sleep and kickstarts your metabolism.</p>
          
          <h2>2. Practice Mindful Breathing</h2>
          <p>Take 5 minutes for deep breathing exercises or meditation. This reduces stress hormones and increases mental clarity.</p>
          
          <h2>3. Gentle Stretching or Yoga</h2>
          <p>Move your body with gentle stretches or a short yoga session. This improves circulation and flexibility while energizing your body.</p>
          
          <h2>4. Eat a Nutritious Breakfast</h2>
          <p>Fuel your body with a balanced breakfast containing protein, healthy fats, and complex carbohydrates. This stabilizes blood sugar and sustains energy.</p>
          
          <h2>5. Set Intentions for the Day</h2>
          <p>Take a moment to plan your day and set positive intentions. This mental preparation helps you stay focused and purposeful.</p>
          
          <blockquote>
            <p>"The way you start your day can affect your whole day. Begin it with a positive mind and a grateful heart." - Anonymous</p>
          </blockquote>
          
          <h2>Making It Stick</h2>
          <p>Start with one or two habits and gradually add more as they become routine. Consistency is key to seeing lasting benefits.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200",
        authorName: "Michael Chen",
        authorRole: "Wellness Coach",
        date: "10 December 2025",
        isPublished: true,
        isFeatured: false,
        displayOrder: 3,
      },
      {
        title: "Perfect Gift Ideas: Natural Beauty Sets for Every Occasion",
        slug: "perfect-gift-ideas-natural-beauty-sets",
        category: "Gifting",
        excerpt: "Struggling to find the perfect gift? Discover our curated selection of natural beauty gift sets that everyone will love.",
        content: `
          <h2>Why Natural Beauty Gifts?</h2>
          <p>Natural beauty products make thoughtful gifts because they show you care about the recipient's health and wellbeing. They're suitable for all ages and occasions.</p>
          
          <h2>Gift Ideas by Occasion</h2>
          
          <h3>For Birthdays</h3>
          <p>A luxurious skincare set with cleanser, toner, moisturizer, and face mask is perfect for celebrating someone special. Add a personalized note for extra thoughtfulness.</p>
          
          <h3>For Mother's Day</h3>
          <p>Show mom you care with a relaxation spa set including bath salts, body butter, essential oils, and a plush robe. It's the gift of self-care she deserves.</p>
          
          <h3>For Weddings</h3>
          <p>Elegant gift boxes containing natural perfumes, hand creams, and lip balms make sophisticated wedding gifts that guests will actually use.</p>
          
          <h3>For Corporate Gifts</h3>
          <p>Professional gift sets with premium hand creams, lip balms, and travel-sized products show appreciation while maintaining a polished image.</p>
          
          <h2>How to Choose the Right Gift</h2>
          <ul>
            <li>Consider the recipient's skin type and preferences</li>
            <li>Look for hypoallergenic and fragrance-free options for sensitive skin</li>
            <li>Choose beautifully packaged sets for maximum impact</li>
            <li>Include a variety of products for a complete experience</li>
          </ul>
          
          <h2>Personalization Tips</h2>
          <p>Add a personal touch by:</p>
          <ul>
            <li>Including a handwritten note</li>
            <li>Choosing the recipient's favorite scents</li>
            <li>Adding decorative ribbons or gift bags</li>
            <li>Creating a custom gift basket with their preferences</li>
          </ul>
        `,
        coverImage: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200",
        authorName: "Prakriti Team",
        authorRole: "Gift Curator",
        date: "5 December 2025",
        isPublished: true,
        isFeatured: false,
        displayOrder: 4,
      },
      {
        title: "Autumn Skincare Transition: Preparing Your Skin for Colder Weather",
        slug: "autumn-skincare-transition-preparing-skin",
        category: "Seasonal",
        excerpt: "As temperatures drop, your skin needs extra care. Learn how to transition your skincare routine for the autumn season.",
        content: `
          <h2>Why Seasonal Skincare Matters</h2>
          <p>As the weather changes, so do your skin's needs. The transition from summer to autumn requires adjustments to your skincare routine to maintain healthy, balanced skin.</p>
          
          <h2>Key Changes to Make</h2>
          
          <h3>1. Switch to Creamier Cleansers</h3>
          <p>Replace gel cleansers with cream or oil-based formulas that won't strip your skin's natural oils. This helps maintain the skin barrier as humidity drops.</p>
          
          <h3>2. Add a Facial Oil</h3>
          <p>Incorporate a nourishing facial oil into your routine. Apply it after your moisturizer to seal in hydration and protect against harsh winds.</p>
          
          <h3>3. Increase Exfoliation (Gently)</h3>
          <p>Use gentle chemical exfoliants 2-3 times per week to remove dead skin cells and allow better absorption of moisturizing products.</p>
          
          <h3>4. Layer Your Products</h3>
          <p>Use the "sandwich" method: apply hydrating toner, serum, moisturizer, and then seal with an occlusive product at night.</p>
          
          <h2>Don't Forget</h2>
          <ul>
            <li>Keep using sunscreen - UV rays are present year-round</li>
            <li>Protect your lips with a nourishing lip balm</li>
            <li>Don't forget your hands and neck</li>
            <li>Consider a overnight sleeping mask</li>
          </ul>
          
          <h2>Ingredients to Look For</h2>
          <p>As you update your products, look for these skin-loving ingredients:</p>
          <ul>
            <li><strong>Hyaluronic Acid</strong> - Draws moisture into the skin</li>
            <li><strong>Ceramides</strong> - Repair and strengthen the skin barrier</li>
            <li><strong>Squalane</strong> - Lightweight oil that mimics skin's natural sebum</li>
            <li><strong>Shea Butter</strong> - Rich moisturizer for very dry skin</li>
          </ul>
        `,
        coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200",
        authorName: "Dr. Lisa Martinez",
        authorRole: "Skincare Specialist",
        date: "20 October 2025",
        isPublished: true,
        isFeatured: false,
        displayOrder: 5,
      },
      {
        title: "Building a Sustainable Beauty Routine: Better for You and the Planet",
        slug: "building-sustainable-beauty-routine",
        category: "Lifestyle",
        excerpt: "Discover how to create an eco-friendly beauty routine that's good for your skin and kind to the environment.",
        content: `
          <h2>What is Sustainable Beauty?</h2>
          <p>Sustainable beauty means choosing products and practices that minimize environmental impact while delivering effective results. It's about making conscious choices that benefit both you and the planet.</p>
          
          <h2>Key Principles of Sustainable Beauty</h2>
          
          <h3>1. Choose Natural and Organic</h3>
          <p>Opt for products made with natural, organic ingredients that are grown without harmful pesticides. These are better for your skin and the environment.</p>
          
          <h3>2. Look for Minimal Packaging</h3>
          <p>Select brands that use recyclable, biodegradable, or minimal packaging. Glass containers are preferable to plastic.</p>
          
          <h3>3. Buy Multi-Purpose Products</h3>
          <p>Reduce waste by choosing products that serve multiple purposes, like a tinted moisturizer with SPF or a lip and cheek stain.</p>
          
          <h3>4. Support Ethical Brands</h3>
          <p>Choose companies committed to fair trade, cruelty-free practices, and environmental sustainability.</p>
          
          <h2>Simple Swaps to Make</h2>
          <ol>
            <li>Replace disposable cotton pads with reusable cloth pads</li>
            <li>Use bar soaps instead of liquid cleansers in plastic bottles</li>
            <li>Switch to bamboo or metal razors instead of disposable plastic ones</li>
            <li>Choose refillable packaging when available</li>
            <li>Buy products with natural, biodegradable ingredients</li>
          </ol>
          
          <h2>DIY Beauty Recipes</h2>
          <p>Consider making some products at home using simple, natural ingredients:</p>
          
          <h3>Honey Face Mask</h3>
          <p>Mix raw honey with a little yogurt for a hydrating, anti-bacterial face mask.</p>
          
          <h3>Sugar Scrub</h3>
          <p>Combine sugar with coconut oil for an effective, gentle body exfoliant.</p>
          
          <h3>Rosewater Toner</h3>
          <p>Use pure rosewater as a natural, refreshing facial toner.</p>
          
          <h2>The Impact of Your Choices</h2>
          <p>By making sustainable beauty choices, you're contributing to:</p>
          <ul>
            <li>Reduced plastic waste in oceans and landfills</li>
            <li>Lower carbon emissions from production and shipping</li>
            <li>Protection of biodiversity and ecosystems</li>
            <li>Better working conditions for farmers and workers</li>
          </ul>
          
          <blockquote>
            <p>"We don't need a handful of people doing zero waste perfectly. We need millions of people doing it imperfectly." - Anne Marie Bonneau</p>
          </blockquote>
        `,
        coverImage: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=1200",
        authorName: "Sophie Green",
        authorRole: "Sustainability Advocate",
        date: "1 December 2025",
        isPublished: true,
        isFeatured: true,
        displayOrder: 6,
      },
    ]);

    console.log(`✅ Created ${blogs.length} sample blogs`);
    console.log("\n✨ Seeding complete! Your blog section is ready.\n");

    // Display summary
    console.log("📊 Summary:");
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Blogs: ${blogs.length}`);
    console.log(`   Published: ${blogs.filter((b) => b.isPublished).length}`);
    console.log(`   Featured: ${blogs.filter((b) => b.isFeatured).length}`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedBlogs();
