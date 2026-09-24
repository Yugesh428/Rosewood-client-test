/**
 * Seed script for blog posts
 * Usage: npx tsx scripts/seed-blogs.ts
 */

import sequelize from "../src/lib/database/sequelize";
import Blog from "../src/features/Ui/blog/blogModel";

const sampleBlogs = [
  {
    title: "The Daily Moisturizing Ritual Behind Effortlessly Glowing Skin",
    slug: "daily-moisturizing-ritual-glowing-skin",
    category: "Skin Care",
    excerpt: "We all chase that effortless glow — the kind that looks like you just came from a spa, even on a Tuesday morning. The secret? It's not a filter. It's a consistent moisturizing ritual built around ingredients your skin actually recognizes.",
    content: `
      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        We all chase that effortless glow — the kind that looks like you just came from a spa, even on a Tuesday morning. The secret? It's not a filter. It's a consistent moisturizing ritual built around ingredients your skin actually recognizes.
      </p>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-12">
        A discerning beauty gift takes only one thing into consideration: the person you're gifting to. Whether it's fine skincare for a night of self-care, or styling tools that create strong impressions, the perfect gift is specifically suited to them.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        Why Moisturizing Is Non-Negotiable
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        Your skin loses moisture every single hour through a process called transepidermal water loss (TEWL). Without a protective barrier, that moisture evaporates — leaving you with tightness, dullness, and fine lines that seem to appear overnight. A quality moisturizer doesn't just sit on the surface; it integrates with your skin's lipid layer to create a seal that keeps hydration locked in.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        The Prakriti Deep Silk Difference
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        Our Deep Silk Cream was formulated with a triple-hydration complex: hyaluronic acid draws moisture from the air, squalane reinforces the skin barrier, and shea butter provides a velvety finish that never feels greasy. The result is 48 hours of measurable hydration — clinically tested, botanically powered.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        How to Apply for Maximum Results
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        Apply to slightly damp skin right after cleansing. Use upward, circular motions from your jawline to your forehead. Don't forget your neck and décolletage — they age faster than your face and deserve the same attention. For an extra boost, layer a few drops of our Botanical Serum underneath.
      </p>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6 italic">
        "Your skin remembers every act of kindness. Moisturize like it matters — because it does."
      </p>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-12">
        Great skin is a long game. Start with a moisturizer that works with your biology, not against it, and you'll notice the difference within the first week. That glow isn't magic. It's just good science.
      </p>
    `,
    coverImage: "/uploads/ui/products/photo1/230a35de-d2b8-43e5-8764-ecdbd822020d.jpg",
    authorName: "Prakriti Team",
    authorRole: "Author",
    date: "12 January 2026",
    isPublished: true,
    isFeatured: true,
    displayOrder: 0,
  },
  {
    title: "The 5-Minute Morning Skincare Routine That Actually Works",
    slug: "5-minute-morning-skincare-routine",
    category: "Skin Care",
    excerpt: "No time for a 12-step routine? This simplified morning ritual delivers results without the overwhelm. Perfect for busy mornings when you still want to look your best.",
    content: `
      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        We get it. Mornings are rushed. But that doesn't mean your skin should suffer. This 5-minute routine delivers maximum impact with minimum fuss.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        Step 1: Gentle Cleanse (60 seconds)
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        Start with a splash of lukewarm water and our Botanical Gel Cleanser. Massage in circular motions for 30 seconds, then rinse. Your skin should feel fresh, not tight.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        Step 2: Hydrating Toner (30 seconds)
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        Pat on our Rose Water Toner while skin is still damp. This preps your skin to absorb the next layers more effectively.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        Step 3: Serum (60 seconds)
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        Apply 2-3 drops of Vitamin C Serum. This brightens, protects against pollution, and gives you that lit-from-within glow.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        Step 4: Moisturize (60 seconds)
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        Lock it all in with our Deep Silk Cream. Use upward strokes and don't skip your neck.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        Step 5: SPF (60 seconds)
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-12">
        Non-negotiable. Apply SPF 30 or higher, even on cloudy days. Sun damage is the #1 cause of premature aging.
      </p>
    `,
    coverImage: "/uploads/ui/products/photo2/0351f449-8675-46cf-bafd-7d563c3e6306.jpg",
    authorName: "Prakriti Team",
    authorRole: "Author",
    date: "8 January 2026",
    isPublished: true,
    isFeatured: true,
    displayOrder: 1,
  },
  {
    title: "The Nighttime Nourishing Ritual Your Skin Has Been Craving",
    slug: "nighttime-nourishing-ritual",
    category: "Skin Care",
    excerpt: "Your skin does most of its repair work while you sleep. Support that natural process with a nighttime routine designed to nourish, restore, and regenerate.",
    content: `
      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        While you sleep, your skin shifts into repair mode. Cell turnover accelerates, collagen production ramps up, and your skin becomes more receptive to active ingredients. A strategic nighttime routine amplifies these natural processes.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        Double Cleanse: The Foundation
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        Start with an oil-based cleanser to dissolve makeup and SPF. Follow with a water-based gel cleanser to remove any remaining impurities. This ensures your skin is a clean canvas for treatment products.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        Treatment Serum: Target Your Concerns
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        Night is the time for actives. Whether it's retinol for anti-aging, niacinamide for pores, or hyaluronic acid for hydration, choose one hero ingredient and be consistent with it.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        Night Cream: Seal and Nourish
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-12">
        Our Overnight Recovery Cream is richer than a day moisturizer for good reason. It creates an occlusive barrier that prevents water loss and delivers concentrated botanicals while you rest. Wake up to plumper, more radiant skin.
      </p>
    `,
    coverImage: "/uploads/ui/products/photo1/230a35de-d2b8-43e5-8764-ecdbd822020d.jpg",
    authorName: "Prakriti Team",
    authorRole: "Author",
    date: "28 December 2025",
    isPublished: true,
    isFeatured: false,
    displayOrder: 2,
  },
  {
    title: "12 Best Beauty Gift Ideas",
    slug: "best-beauty-gift-ideas",
    category: "GIFTING",
    excerpt: "Find the best beauty gift ideas, from results-led skincare to refined bath and body treats, chosen for every recipient and occasion with care.",
    content: `
      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        A meticulously kept-up gift should feel considered, not generic. We use beauty gift ideas with products with a sense of occasion—a beautifully composed scent, the subtle silkiness in high-end oils, the detailed care in choosing it.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        How to Choose Beauty Gifts Well
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        Consider what they already enjoy. If they care about natural products, a gentle botanical collection is better than overworking their routine. Gifts from good brands can benefit from premium textures, rare botanicals, and luxurious formulations.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        Best Beauty Gift Ideas by Recipients
      </h2>

      <h3 class="font-heading text-xl md:text-2xl text-[#1A1A1A] mb-4 mt-12">
        1. A Replenishing Moisturizer for the Skincare Devotee
      </h3>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        A high-quality moisturizer is one of the most sensible skincare gifts. It's kind, helps with smoothness, hydrates precisely, and is gentle yet effective.
      </p>

      <h3 class="font-heading text-xl md:text-2xl text-[#1A1A1A] mb-4 mt-12">
        2. An Intelligently Chosen Serum
      </h3>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-12">
        Serums deliver targeted benefits. Whether it's brightening vitamin C, anti-aging retinol, or hydrating hyaluronic acid, a well-chosen serum shows thoughtfulness.
      </p>
    `,
    coverImage: "/uploads/ui/products/photo2/0351f449-8675-46cf-bafd-7d563c3e6306.jpg",
    authorName: "Prakriti Team",
    authorRole: "Author",
    date: "22 September 2026",
    isPublished: true,
    isFeatured: false,
    displayOrder: 3,
  },
  {
    title: "Benefits of Natural Botanical Ingredients",
    slug: "natural-botanical-ingredients",
    category: "WELLNESS",
    excerpt: "Discover how natural botanical extracts work to nourish, protect and revitalize your skin without harsh chemicals.",
    content: `
      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        Nature has been formulating skincare for millions of years. Plants have developed complex chemical compounds to protect themselves from UV damage, oxidative stress, and environmental aggressors—the same challenges our skin faces daily.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        What Makes Botanical Ingredients Effective?
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        Unlike synthetic ingredients that target a single pathway, botanical extracts contain multiple active compounds that work synergistically. For example, green tea extract doesn't just provide antioxidants—it also has anti-inflammatory, antimicrobial, and soothing properties.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        Our Hero Botanical Ingredients
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-6">
        <strong>Rose Water:</strong> Balances pH, soothes irritation, and provides lightweight hydration.<br/>
        <strong>Neem Extract:</strong> Purifying and clarifying, perfect for blemish-prone skin.<br/>
        <strong>Turmeric:</strong> Brightens and evens skin tone with powerful antioxidants.<br/>
        <strong>Aloe Vera:</strong> Heals, hydrates, and calms inflammation.
      </p>

      <h2 class="font-heading text-2xl md:text-3xl text-[#1A1A1A] mb-6 mt-16">
        Why We Choose Organic Sources
      </h2>

      <p class="text-base md:text-lg text-black/70 font-sans leading-relaxed mb-12">
        Organic farming ensures our botanicals are free from pesticides and synthetic fertilizers. This means purer extracts with higher concentrations of active compounds—and better results for your skin.
      </p>
    `,
    coverImage: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=600&fit=crop&q=80",
    authorName: "Prakriti Team",
    authorRole: "Author",
    date: "19 September 2026",
    isPublished: true,
    isFeatured: false,
    displayOrder: 4,
  },
];

async function seedBlogs() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected.");

    // Sync Blog table
    await Blog.sync({ force: false });
    console.log("✅ Blog table ready.");

    // Clear existing blogs (optional - comment out if you want to keep existing)
    // await Blog.destroy({ where: {} });
    // console.log("🗑️  Cleared existing blogs.");

    // Insert sample blogs
    for (const blogData of sampleBlogs) {
      await Blog.create(blogData);
      console.log(`✅ Created blog: ${blogData.title}`);
    }

    console.log(`\n✅ Seeded ${sampleBlogs.length} blog posts successfully!`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedBlogs();
