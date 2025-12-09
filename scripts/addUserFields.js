// scripts/addUserFields.js
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

// 🔹 Database connection
const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "airbnb_db";

// 🔹 Sample bio descriptions
const bioParagraphs = [
  "I am a passionate host who loves providing great stays for guests. With years of experience in hospitality, I ensure every guest feels welcome and comfortable during their stay.",
  "As a dedicated host, I take pride in creating memorable experiences for my guests. I believe that attention to detail and genuine hospitality make all the difference in making travelers feel at home.",
  "Hospitality runs in my family, and I've been hosting guests for many years. I'm committed to providing clean, comfortable spaces and being available to help with any questions or local recommendations.",
  "I love meeting people from around the world and sharing the beauty of our local area. As your host, I strive to make your stay as enjoyable and stress-free as possible.",
  "With a background in tourism and a passion for making people feel welcome, I've created a space that combines comfort with local charm. I'm here to ensure you have an amazing stay.",
  "Being a host is more than just renting a space - it's about creating connections and helping travelers discover the magic of our area. I'm always happy to share tips and recommendations.",
  "I've been in the hospitality industry for over a decade and understand what makes a great stay. From thoughtful amenities to quick communication, I'm dedicated to exceeding your expectations.",
  "As someone who loves to travel myself, I know how important it is to have a welcoming and comfortable place to stay. That's exactly what I aim to provide for all my guests.",
  "My goal as a host is simple: to make sure you feel at home away from home. I take care of every detail and am always available if you need anything during your stay.",
  "I believe in the power of warm hospitality and creating spaces where guests can truly relax. Whether you're here for business or leisure, I'm committed to making your experience exceptional."
];

// 🔹 Sample work titles
const workTitles = [
  "Software Engineer",
  "Marketing Manager",
  "Freelance Designer",
  "Teacher",
  "Real Estate Agent",
  "Chef & Restaurant Owner",
  "Travel Blogger",
  "Architect",
  "Photographer",
  "Small Business Owner",
  "Financial Advisor",
  "Interior Designer",
  "Tour Guide",
  "Yoga Instructor",
  "Writer & Journalist"
];

// 🔹 Generate random response rate (85-100%)
function generateResponseRate() {
  return Math.floor(Math.random() * 16) + 85; // 85-100%
}

// 🔹 Generate random response time (1-24 hours)
function generateResponseTime() {
  const hours = Math.floor(Math.random() * 24) + 1; // 1-24 hours

  if (hours === 1) {
    return "within an hour";
  } else if (hours < 24) {
    return `within ${hours} hours`;
  } else {
    return "within a day";
  }
}

// 🔹 Get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const usersCol = db.collection('user');

    const users = await usersCol.find({}).toArray();
    console.log(`Found ${users.length} users to update\n`);

    let updatedCount = 0;

    for (const user of users) {
      const bio = getRandomItem(bioParagraphs);
      const work = getRandomItem(workTitles);
      const responseRate = generateResponseRate();
      const responseTime = generateResponseTime();

      await usersCol.updateOne(
        { _id: user._id },
        {
          $set: {
            bio,
            work,
            responseRate,
            responseTime
          }
        }
      );

      updatedCount++;
      console.log(`✅ Updated user: ${user.fullname || user.username}`);
      console.log(`   📝 Bio: ${bio.substring(0, 60)}...`);
      console.log(`   💼 Work: ${work}`);
      console.log(`   📊 Response Rate: ${responseRate}%`);
      console.log(`   ⏱️  Response Time: ${responseTime}\n`);
    }

    console.log(`\n🎉 Done! Updated ${updatedCount} users with new fields.`);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
