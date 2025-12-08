// scripts/updateStayLocations.js
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

// 🔹 Database connection
const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "airbnb_db";
const collectionName = "stay";

// 🔹 Base coordinates for each city
const cityBaseCoords = {
  "Eilat":          { lat: 29.5577, lng: 34.9519 },
  "Haifa":          { lat: 32.7940, lng: 34.9896 },
  "Jerusalem":      { lat: 31.7683, lng: 35.2137 },
  "Tel Aviv-Yafo":  { lat: 32.0853, lng: 34.7818 },
  "Zichron Yaakov": { lat: 32.5733, lng: 34.9531 },
  "Mitzpe Ramon":   { lat: 30.6094, lng: 34.8011 },
};

// 🔹 Returns random coordinates close to the city (small deviation around ~2-3 km)
function getRandomCoordAround(base, maxOffsetDegrees = 0.02) {
  const latOffset = (Math.random() - 0.5) * 2 * maxOffsetDegrees;
  const lngOffset = (Math.random() - 0.5) * 2 * maxOffsetDegrees;

  return {
    lat: base.lat + latOffset,
    lng: base.lng + lngOffset,
  };
}

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const staysCol = db.collection(collectionName);

    // Iterate through all stays
    const stays = await staysCol.find({}).toArray();
    console.log("Found", stays.length, "stays");

    for (const stay of stays) {
      const city = stay.loc?.city;

      if (!city) {
        console.log(`⚠️ Stay "${stay.name}" has no loc.city`);
        continue;
      }

      const base = cityBaseCoords[city];

      if (!base) {
        console.log(`⚠️ No base coords found for city: "${city}" (stay: ${stay.name})`);
        continue;
      }

      const { lat, lng } = getRandomCoordAround(base);

      await staysCol.updateOne(
        { _id: stay._id },
        {
          $set: {
            "loc.lat": lat,
            "loc.lng": lng,
          },
        }
      );

      console.log(`✅ Updated "${stay.name}" → ${city} (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
    }

    console.log("🎉 Done updating locations!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
