// scripts/updateStayLabels.js
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

// 🔹 Database connection
const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "airbnb_db";

// 🔹 Label definitions with title and description
const labelDefinitions = [
  {
    title: "Self check-in",
    description: "Check yourself in with the keypad."
  },
  {
    title: "Vibrant neighborhood",
    description: "Guests say this area is walkable with lots to explore, especially for dining out."
  },
  {
    title: "Fast wifi",
    description: "At 573 Mbps, you can take video calls and stream videos."
  },
  {
    title: "Lots to do nearby",
    description: "Guests say this area has plenty to explore."
  },
  {
    title: "Great location",
    description: "90% of recent guests gave the location a 5-star rating."
  },
  {
    title: "Pet-friendly",
    description: "Bring your pets along for the stay."
  },
  {
    title: "Free parking",
    description: "This is one of the few places in the area with free parking."
  },
  {
    title: "Experienced host",
    description: "This host has hosted hundreds of guests with excellent reviews."
  },
  {
    title: "Sparkling clean",
    description: "Recent guests said this place was sparkling clean."
  },
  {
    title: "Great check-in experience",
    description: "100% of recent guests gave the check-in process a 5-star rating."
  },
  {
    title: "Highly rated",
    description: "This home is highly rated for its accuracy, communication, and more."
  },
  {
    title: "Scenic views",
    description: "Guests love the beautiful views from this property."
  },
  {
    title: "Kitchen essentials",
    description: "Fully equipped kitchen with everything you need to cook."
  },
  {
    title: "Workspace",
    description: "A dedicated workspace with good wifi for remote work."
  },
  {
    title: "Pool access",
    description: "Enjoy access to a refreshing swimming pool."
  },
  {
    title: "Beach nearby",
    description: "Short walk to the beach for sun and sand."
  },
  {
    title: "Family-friendly",
    description: "Great amenities and space for families with children."
  },
  {
    title: "Luxury amenities",
    description: "High-end finishes and premium amenities throughout."
  },
  {
    title: "Quiet retreat",
    description: "Peaceful location away from the hustle and bustle."
  },
  {
    title: "Central location",
    description: "Walking distance to restaurants, shops, and attractions."
  }
];

// 🔹 Get random labels (2-3 labels per stay)
function getRandomLabels() {
  const count = Math.floor(Math.random() * 2) + 2; // 2 or 3 labels
  const shuffled = [...labelDefinitions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const staysCol = db.collection('stay');

    const stays = await staysCol.find({}).toArray();
    console.log(`Found ${stays.length} stays to update\n`);

    let updatedCount = 0;

    for (const stay of stays) {
      const newLabels = getRandomLabels();

      await staysCol.updateOne(
        { _id: stay._id },
        { $set: { labels: newLabels } }
      );

      updatedCount++;
      console.log(`✅ Updated stay: ${stay.name}`);
      console.log(`   Old labels: [${stay.labels ? stay.labels.join(', ') : 'none'}]`);
      console.log(`   New labels:`);
      newLabels.forEach(label => {
        console.log(`      • ${label.title}: ${label.description}`);
      });
      console.log('');
    }

    console.log(`\n🎉 Done! Updated ${updatedCount} stays with new label objects.`);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
