const fs = require('fs');

// מזהי המשתמשים (Owners) שסופקו - משמשים לכל תפקידי המשתמשים בתוך הנתונים
const VALID_USER_IDS = [
  "6928382dbd5c05a58bfbe573",
  "6928382dbd5c05a58bfbe574",
  "6928382dbd5c05a58bfbe575",
  "6928382dbd5c05a58bfbe576",
  "6928382dbd5c05a58bfbe577",   
  "6928386dbd5c05a58bfbe578",
  "6928386dbd5c05a58bfbe579",
  "6928386dbd5c05a58bfbe57a",
  "6928386dbd5c05a58bfbe57b",
  "6928386dbd5c05a58bfbe57c"
];

// מפות שמות כדי להפוך את הנתונים לריאליסטיים יותר
const HOST_NAMES_MAP = {
    "6928382dbd5c05a58bfbe573": "adminos adminis",
    "6928382dbd5c05a58bfbe574": "Dana Levi",
    "6928382dbd5c05a58bfbe575": "Yossi Israeli",
    "6928382dbd5c05a58bfbe576": "Maya Goren",
    "6928382dbd5c05a58bfbe577": "Shai Davidi",
    "6928386dbd5c05a58bfbe578": "Noa Hadad",
    "6928386dbd5c05a58bfbe579": "Idan Golan",
    "6928386dbd5c05a58bfbe57a": "Shira Bennett",
    "6928386dbd5c05a58bfbe57b": "Ronen Perez",
    "6928386dbd5c05a58bfbe57c": "Adi Katz"
};

// --- נתונים סטטיים לבחירה רנדומלית ---
const CITIES = ['Tel Aviv-Yafo', 'Jerusalem', 'Haifa', 'Eilat', 'Zichron Yaakov', 'Mitzpe Ramon'];
const TYPES = ['Apartment', 'House', 'Villa', 'Cabin', 'Loft'];
const AMENITIES = [
  ["Wifi", "AC", "Kitchen", "Dedicated workspace","Free parking","TV"],
  ["Wifi", "Pool","Gym", "Beach access", "Parking", "Elevator","Spa access"],
  ["Heating", "Garden", "Balcony", "BBQ grill", "Washer","Dryer","Wine tasting"]
];
const LABELS = ['Artsy', 'Village', 'Luxury', 'Beachfront', 'Desert View', 'City Center', 'Unique'];
const HOUSE_RULES = ["No parties", "No smoking indoors", "Pets allowed (with fee)", "Quiet hours after 22:00"];


// --- פונקציות עזר ---

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * בוחר מזהה משתמש רנדומלי מתוך המזהים שסופקו
 * @returns {string} ObjectID מחרוזת
 */
function getRandomValidUserId() {
    return getRandomItem(VALID_USER_IDS);
}

/**
 * מחזיר אובייקט Date עתידי
 * @param {number} minDays הוספת ימים מינימלית מהיום
 * @param {number} maxDays הוספת ימים מקסימלית מהיום
 * @returns {Date} אובייקט תאריך עתידי
 */
function getRandomFutureDate(minDays, maxDays) {
    const daysToAdd = getRandomInt(minDays, maxDays);
    const date = new Date();
    // מוסיף מספר ימים
    date.setDate(date.getDate() + daysToAdd); 
    // מאפס את השעה לחצות כדי לשמור על עקביות בבדיקות תאריכים
    date.setUTCHours(0, 0, 0, 0); 
    return date;
}


function generateStay(index) {
  const city = getRandomItem(CITIES);
  const type = getRandomItem(TYPES);
  const basePrice = getRandomInt(300, 1500);
  const guests = getRandomInt(2, 8);
  const bedrooms = Math.max(1, Math.ceil(guests / 3));
  const bathrooms = Math.max(1, Math.ceil(bedrooms / 2));
  const currentAmenities = [...new Set([].concat(...AMENITIES.filter(() => Math.random() > 0.4)))];
  
  // *** עקביות מזהים (IDs) ***
  const ownerId = getRandomValidUserId(); // ה-Owner של הנכס
  const hostId = ownerId; // בשביל פשטות, נגדיר את Host זהה ל-Owner
  const hostName = HOST_NAMES_MAP[hostId] || "Consistent Host";

  // יצירת ביקורת רנדומלית - המבקר חייב להיות אחד מ-10 המזהים
  const createReview = (reviewIndex) => {
      const reviewerId = getRandomValidUserId(); 
      return {
          "_id": `r${index * 2 + reviewIndex}`,
          "txt": getRandomItem(["מקום מדהים!", "חוויה מצוינת, קצת רועש בערב.", "נקי ומסודר, מומלץ בחום.", "היה טוב, פשוט.", "מארח מעולה."]),
          "rating": getRandomInt(3, 5),
          "createdAt": new Date(Date.now() - getRandomInt(30, 365) * 24 * 60 * 60 * 1000).toISOString(),
          "byUser": {
              "_id": reviewerId, // מזהה מתוך הרשימה הסגורה
              "fullname": HOST_NAMES_MAP[reviewerId] || `Reviewer ${reviewerId.substring(18)}`,
              "imgUrl": `https://picsum.photos/id/${getRandomInt(20, 100)}/50/50`
          }
      }
  };

  // --- יצירת תאריכי חוסר זמינות עתידיים ---
  const unavailableDates = [];
  // יוצרים 0 עד 2 בלוקים של חוסר זמינות עבור כל נכס
  const numBlocks = Math.random() > 0.6 ? 0 : getRandomInt(1, 2); 
  
  for (let i = 0; i < numBlocks; i++) {
    const start = getRandomFutureDate(30, 180); // מתחיל בין חודש לחצי שנה קדימה
    const end = new Date(start);
    end.setDate(start.getDate() + getRandomInt(3, 10)); // נמשך בין 3 ל-10 ימים
    
    unavailableDates.push({
        // שמירת התאריכים בפורמט ISO String כדי שמונגו יזהה אותם כ-Date Type
        "startDate": start.toISOString().substring(0, 10), // רק תאריך, ללא שעות 
        "endDate": end.toISOString().substring(0, 10)
    });
  }
  // ------------------------------------------

  const reviewCount = getRandomInt(10, 50);
  const avgRating = getRandomFloat(3.8, 5.0);

  // רשימת משתמשים שאוהבים - מתוך הרשימה הסגורה
  const likedByUserIds = [];
  if (Math.random() > 0.6) {
      const numLikes = getRandomInt(1, 4);
      while(likedByUserIds.length < numLikes) {
          const likerId = getRandomValidUserId();
          if (!likedByUserIds.includes(likerId)) {
              likedByUserIds.push(likerId);
          }
      }
  }

  const stay = {
    "ownerId": ownerId, // מזהה מתוך הרשימה
    "name": `${getRandomItem(LABELS)} ${type} in ${city} ${index + 1}`,
    "type": type,
    "summary": `A ${type.toLowerCase()} located in ${city}. Perfect for up to ${guests} guests.`,
    "imgUrls": [
      `https://picsum.photos/seed/${index}a/800/600`,
      `https://picsum.photos/seed/${index}b/800/600`,
      `https://picsum.photos/seed/${index}c/800/600`
    ],
    "price": {
      "base": basePrice,
      "currency": "ILS",
      "cleaningFee": getRandomInt(50, 200),
      "serviceFeePct": parseFloat(getRandomFloat(0.08, 0.15))
    },
    "capacity": {
      "guests": guests,
      "bedrooms": bedrooms,
      "beds": bedrooms + getRandomInt(0, 2),
      "bathrooms": bathrooms
    },
    "amenities": currentAmenities,
    "labels": [...new Set([type, city === 'Jerusalem' ? 'Historical' : getRandomItem(LABELS)])],
    "host": {
      "_id": hostId, // מזהה מתוך הרשימה
      "fullname": hostName,
      "picture": `https://picsum.photos/id/${getRandomInt(100, 150)}/50/50`,
      "isSuperhost": Math.random() > 0.4
    },
    "loc": {
      "country": "Israel",
      "countryCode": "IL",
      "city": city,
      "address": `${city} St ${index + 1}`,
      "lat": 31.0 + Math.random() * 2,
      "lng": 34.5 + Math.random() * 1.5
    },
    "houseRules": [...new Set(HOUSE_RULES.filter(() => Math.random() > 0.5))],
    "checkIn": { "from": "15:00", "to": "20:00" },
    "checkOut": { "by": "11:00" },
    "unavailable": unavailableDates, // הוספת תאריכי העתיד שיצרנו
    "rating": {
        "avg": parseFloat(avgRating),
        "count": reviewCount
    },
    "reviews": [createReview(1), createReview(2)],
    "likedByUserIds": likedByUserIds // מזהים מתוך הרשימה הסגורה
  };

  return stay;
}

const stays = [];
for (let i = 0; i < 100; i++) {
  stays.push(generateStay(i));
}

// כותב את המערך לקובץ JSON
try {
  fs.writeFileSync('stays_data_fix_future_dates.json', JSON.stringify(stays, null, 2));
  console.log('✅ קובץ stays_data_fix_future_dates.json נוצר בהצלחה עם 100 רשומות.');
  console.log('✅ שדה "unavailable" מעודכן עם תאריכים עתידיים, המתחילים כחודש עד חצי שנה קדימה.');
} catch (err) {
  console.error('❌ שגיאה בכתיבת הקובץ:', err);
}