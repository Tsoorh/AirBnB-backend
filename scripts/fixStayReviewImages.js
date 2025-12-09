// scripts/fixStayReviewImages.js
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

// 🔹 Database connection
const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "airbnb_db";

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const staysCol = db.collection('stay');
    const usersCol = db.collection('user');

    // Get all users to create a mapping of userId -> imgUrl
    const users = await usersCol.find({}).toArray();
    const userImgMap = {};

    users.forEach(user => {
      userImgMap[user._id.toString()] = user.imgUrl;
    });

    console.log(`Found ${users.length} users`);

    // Get all stays
    const stays = await staysCol.find({}).toArray();
    console.log(`Found ${stays.length} stays to check\n`);

    let updatedStaysCount = 0;
    let updatedReviewsCount = 0;

    for (const stay of stays) {
      if (!stay.reviews || stay.reviews.length === 0) {
        continue;
      }

      let stayNeedsUpdate = false;
      const updatedReviews = stay.reviews.map(review => {
        if (review.byUser && review.byUser._id) {
          const userId = review.byUser._id.toString();
          const correctImgUrl = userImgMap[userId];

          // Check if we found the user and if the image URL needs updating
          if (correctImgUrl && review.byUser.imgUrl !== correctImgUrl) {
            stayNeedsUpdate = true;
            updatedReviewsCount++;
            console.log(`  📝 Updating review by ${review.byUser.fullname}`);
            console.log(`     Old: ${review.byUser.imgUrl}`);
            console.log(`     New: ${correctImgUrl}`);

            return {
              ...review,
              byUser: {
                ...review.byUser,
                imgUrl: correctImgUrl
              }
            };
          }
        }
        return review;
      });

      if (stayNeedsUpdate) {
        await staysCol.updateOne(
          { _id: stay._id },
          { $set: { reviews: updatedReviews } }
        );
        updatedStaysCount++;
        console.log(`✅ Updated stay: ${stay.name} (${stay._id})\n`);
      }
    }

    console.log("\n🎉 Done!");
    console.log(`📊 Summary:`);
    console.log(`   - Updated ${updatedReviewsCount} reviews`);
    console.log(`   - Across ${updatedStaysCount} stays`);
    console.log(`   - All review images now match user collection images`);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
