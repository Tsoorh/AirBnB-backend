import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the data files
const stays = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/airbnb_db.stay.json'), 'utf8'));
const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/airbnb_db.user.json'), 'utf8'));

// Helper function to generate random date
function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to add days to a date
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Helper function to calculate nights between two dates
function calculateNights(checkIn, checkOut) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((checkOut - checkIn) / oneDay));
}

// Helper function to get user by ID
function getUserById(userId) {
    const user = users.find(u => {
        if (typeof u._id === 'string') {
            return u._id === userId;
        }
        return u._id.$oid === userId;
    });
    return user;
}

// Status options
const statuses = ['approved', 'rejected', 'on hold', 'passed'];

// Generate 100 orders
const orders = [];

for (let i = 0; i < 100; i++) {
    // Pick a random stay
    const stay = stays[Math.floor(Math.random() * stays.length)];

    // Get the stay ID
    const stayId = typeof stay._id === 'string' ? stay._id : stay._id.$oid;

    // Get host information from users based on ownerId
    const hostUser = getUserById(stay.ownerId);

    // Pick a random guest (different from host)
    let guestUser;
    do {
        guestUser = users[Math.floor(Math.random() * users.length)];
    } while (hostUser && guestUser &&
             ((typeof hostUser._id === 'string' ? hostUser._id : hostUser._id.$oid) ===
              (typeof guestUser._id === 'string' ? guestUser._id : guestUser._id.$oid)));

    const guestId = typeof guestUser._id === 'string' ? guestUser._id : guestUser._id.$oid;

    // Generate random dates
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-12-31');
    const checkIn = getRandomDate(startDate, endDate);

    // Random number of nights (1-14)
    const nights = Math.floor(Math.random() * 14) + 1;
    const checkOut = addDays(checkIn, nights);

    // Generate guest numbers
    const maxGuests = stay.capacity?.guests || 2;
    const adults = Math.floor(Math.random() * maxGuests) + 1;
    const children = Math.random() > 0.7 ? Math.floor(Math.random() * 2) : 0;
    const infants = Math.random() > 0.8 ? Math.floor(Math.random() * 2) : 0;
    const pets = Math.random() > 0.9 ? Math.floor(Math.random() * 2) : 0;

    // Calculate pricing
    const pricePerNight = stay.price?.base || 500;
    const subtotal = pricePerNight * nights;
    const serviceFee = Math.round(subtotal * (stay.price?.serviceFeePct || 0.13));
    const cleaningFee = stay.price?.cleaningFee || 100;
    const totalPrice = subtotal + serviceFee + cleaningFee;

    // Random status
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Create the order
    const order = {
        status,
        host: {
            _id: hostUser ? (typeof hostUser._id === 'string' ? hostUser._id : hostUser._id.$oid) : '',
            fullname: hostUser?.fullname || '',
            imgUrl: hostUser?.imgUrl || ''
        },
        guest: {
            _id: guestId,
            fullname: guestUser.fullname
        },
        totalPrice,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests: {
            adults,
            children,
            infants,
            pets
        },
        stay: {
            _id: stayId,
            name: stay.name,
            imgUrl: stay.imgUrls?.[0] || ''
        },
        nights,
        priceBreakdown: {
            pricePerNight,
            subtotal,
            serviceFee,
            cleaningFee,
            total: totalPrice
        }
    };

    orders.push(order);
}

// Write to file
const outputPath = path.join(__dirname, 'airbnb_db.order.json');
fs.writeFileSync(outputPath, JSON.stringify(orders, null, 2));

console.log(`Successfully generated ${orders.length} orders!`);
console.log(`Output file: ${outputPath}`);
