// scripts/updateStayReviewImages.js
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

// 🔹 Database connection
const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "airbnb_db";

// 🔹 Function to generate automatic avatar URL (same format as user.imgUrl)
function buildAvatarUrl(userId) {
  return `https://i.pravatar.cc/150?u=${userId.toString()}`;
}

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
      userImgMap[user._id.toString()] = user.imgUrl || buildAvatarUrl(user._id);
    });

    console.log(`Found ${users.length} users`);

    // Get all stays
    const stays = await staysCol.find({}).toArray();
    console.log(`Found ${stays.length} stays to check`);

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
          const correctImgUrl = userImgMap[userId] || buildAvatarUrl(review.byUser._id);

          // Check if the image URL needs updating
          if (review.byUser.imgUrl !== correctImgUrl) {
            stayNeedsUpdate = true;
            updatedReviewsCount++;
            console.log(`  📝 Updating review by ${review.byUser.fullname}: ${review.byUser.imgUrl} → ${correctImgUrl}`);

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
        console.log(`✅ Updated stay: ${stay.name} (${stay._id})`);
      }
    }

    console.log("\n🎉 Done!");
    console.log(`📊 Summary: Updated ${updatedReviewsCount} reviews across ${updatedStaysCount} stays`);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
