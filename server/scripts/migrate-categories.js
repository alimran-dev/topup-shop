/**
 * Migration Script: Convert hardcoded string categories to categories collection
 *
 * Run once: node scripts/migrate-categories.js
 *
 * What it does:
 * 1. Creates the `categories` collection with 6 seeded categories
 * 2. Converts all `services` documents from `category: "string"` → `categoryId: ObjectId`
 */

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const DB_URI =
  process.env.DB_URI || "mongodb://127.0.0.1:27017/topupDB";

const CATEGORY_MAP = {
  "Recharge & Offers": 1,
  "FF Topup & Unipin": 2,
  "Telegram Packages": 3,
  "Like - Follow - Subscribe": 4,
  Subscription: 5,
  Others: 6,
};

async function migrate() {
  const client = new MongoClient(DB_URI);

  try {
    await client.connect();
    const db = client.db();
    console.log("Connected to DB");

    const categoryCollection = db.collection("categories");
    const serviceCollection = db.collection("services");

    // Step 1: Check if categories already exist
    const existingCount = await categoryCollection.countDocuments();
    if (existingCount > 0) {
      console.log(
        `Categories collection already has ${existingCount} documents. Skipping seed.`
      );
    } else {
      // Seed the 6 categories
      const categories = Object.entries(CATEGORY_MAP).map(
        ([title, serial]) => ({
          title,
          serial,
          isActive: true,
          createdAt: new Date(),
        })
      );
      const insertResult = await categoryCollection.insertMany(categories);
      console.log(
        `Seeded ${insertResult.insertedCount} categories:`,
        Object.keys(insertResult.insertedIds)
      );
    }

    // Step 2: Build a lookup map (title → ObjectId)
    const allCategories = await categoryCollection.find().toArray();
    const titleToIdMap = {};
    allCategories.forEach((cat) => {
      titleToIdMap[cat.title] = cat._id;
    });
    console.log("Category lookup map:", titleToIdMap);

    // Step 3: Migrate services that still have the old `category` string field
    const servicesToMigrate = await serviceCollection
      .find({ category: { $exists: true, $type: "string" } })
      .toArray();

    console.log(`Found ${servicesToMigrate.length} services to migrate`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const service of servicesToMigrate) {
      const oldCategory = service.category;
      const newCategoryId = titleToIdMap[oldCategory];

      if (!newCategoryId) {
        console.log(
          `WARNING: No matching category found for "${oldCategory}" (service: ${service.title})`
        );
        skippedCount++;
        continue;
      }

      await serviceCollection.updateOne(
        { _id: service._id },
        {
          $set: { categoryId: newCategoryId },
          $unset: { category: "" },
        }
      );
      updatedCount++;
      console.log(
        `Migrated: "${service.title}" — "${oldCategory}" → categoryId: ${newCategoryId}`
      );
    }

    console.log("\n--- Migration Summary ---");
    console.log(`Total categories seeded: ${allCategories.length}`);
    console.log(`Services migrated: ${updatedCount}`);
    console.log(`Services skipped: ${skippedCount}`);
    console.log("--- Done ---");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.close();
    console.log("DB connection closed");
  }
}

migrate();