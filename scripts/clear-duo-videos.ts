import sequelize from "../src/lib/database/sequelize";

async function run() {
  await sequelize.authenticate();
  console.log("✅ Connected");

  // Clear old stale JSONB blob + legacy single-video columns
  await sequelize.query(`
    UPDATE "ui_featured_duo"
    SET
      "videos"     = '[]',
      "videoUrl"   = NULL,
      "videoBrand" = NULL,
      "videoTitle" = NULL,
      "videoLink"  = NULL
  `);
  console.log("✅ Cleared old video data from ui_featured_duo");

  // Clear all rows from the new video table too (fresh start)
  await sequelize.query(`DELETE FROM "ui_featured_duo_videos"`);
  console.log("✅ Cleared ui_featured_duo_videos table");

  await sequelize.close();
}

run().catch(e => { console.error(e); process.exit(1); });
