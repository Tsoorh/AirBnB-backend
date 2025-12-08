// scripts/updateUserImages.js
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

// 🔹 Database connection
const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "airbnb_db";
const collectionName = "user";

// 🔹 Function to generate automatic avatar URL
function buildAvatarUrl(user) {
  return `https://i.pravatar.cc/150?u=${user._id.toString()}`;
}

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const usersCol = db.collection(collectionName);

    const users = await usersCol.find({}).toArray();
    console.log("Found", users.length, "users to update");

    for (const user of users) {
      const newImgUrl = buildAvatarUrl(user);

      await usersCol.updateOne(
        { _id: user._id },
        { $set: { imgUrl: newImgUrl } }
      );

      console.log(`✅ Updated user: ${user.fullname || user.username} → ${newImgUrl}`);
    }

    console.log("🎉 Done updating user images!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
