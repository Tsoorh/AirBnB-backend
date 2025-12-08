// scripts/updateStayImages.js
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

// 🔹 1. Database connection
const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "airbnb_db";
const collectionName = "stay";

// 🔹 2. List of apartment images (direct Unsplash image URLs)
const apartmentImages = [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
    // "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1564540583246-934409427776?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
];

function getRandomImages(count = 3) {
  const res = [];
  const usedIndices = new Set();

  while (res.length < count && usedIndices.size < apartmentImages.length) {
    const idx = Math.floor(Math.random() * apartmentImages.length);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      res.push(apartmentImages[idx]);
    }
  }

  return res;
}

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const staysCol = db.collection(collectionName);

    // Find ALL stays (remove the query filter to update all)
    const query = {};

    const stays = await staysCol.find(query).toArray();
    console.log("Found", stays.length, "stays to update");

    for (const stay of stays) {
      const newImgs = getRandomImages(5); // Get 5 images per stay

      await staysCol.updateOne(
        { _id: stay._id },
        { $set: { imgUrls: newImgs } }
      );

      console.log("Updated stay:", stay.name);
    }

    console.log("✅ Done updating images!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
