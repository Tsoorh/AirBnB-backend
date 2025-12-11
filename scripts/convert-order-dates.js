import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

// Configuration
const DB_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'airbnb_db';

function formatDateToSimple(dateValue) {
    if (!dateValue) return null;

    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

async function convertOrderDates() {
    const client = new MongoClient(DB_URL);

    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected successfully!');

        const db = client.db(DB_NAME);
        const ordersCollection = db.collection('order');

        // Get all orders
        const allOrders = await ordersCollection.find({}).toArray();
        console.log(`\nFound ${allOrders.length} orders to process`);

        let updatedCount = 0;

        for (const order of allOrders) {
            const updates = {};

            // Convert checkIn if it exists
            if (order.checkIn) {
                const currentCheckIn = typeof order.checkIn === 'string' ? order.checkIn : order.checkIn.toISOString();
                const newCheckIn = formatDateToSimple(order.checkIn);

                if (currentCheckIn !== newCheckIn) {
                    updates.checkIn = newCheckIn;
                }
            }

            // Convert checkOut if it exists
            if (order.checkOut) {
                const currentCheckOut = typeof order.checkOut === 'string' ? order.checkOut : order.checkOut.toISOString();
                const newCheckOut = formatDateToSimple(order.checkOut);

                if (currentCheckOut !== newCheckOut) {
                    updates.checkOut = newCheckOut;
                }
            }

            // Update if there are changes
            if (Object.keys(updates).length > 0) {
                await ordersCollection.updateOne(
                    { _id: order._id },
                    { $set: updates }
                );
                updatedCount++;
                console.log(`✓ Updated order ${order._id}:`);
                if (updates.checkIn) console.log(`  checkIn: ${order.checkIn} → ${updates.checkIn}`);
                if (updates.checkOut) console.log(`  checkOut: ${order.checkOut} → ${updates.checkOut}`);
            }
        }

        console.log(`\n=== Conversion Complete ===`);
        console.log(`Total orders processed: ${allOrders.length}`);
        console.log(`Total orders updated: ${updatedCount}`);

    } catch (err) {
        console.error('Conversion failed:', err);
        throw err;
    } finally {
        await client.close();
        console.log('\nDatabase connection closed');
    }
}

// Run the conversion
convertOrderDates()
    .then(() => {
        console.log('\n✓ Script finished successfully');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n✗ Script failed:', err);
        process.exit(1);
    });
