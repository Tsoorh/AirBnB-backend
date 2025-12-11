import { MongoClient, ObjectId } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

// Configuration
const DB_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'airbnb_db';

async function migrateOrders() {
    const client = new MongoClient(DB_URL);

    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected successfully!');

        const db = client.db(DB_NAME);
        const ordersCollection = db.collection('order');
        const staysCollection = db.collection('stay');

        // Part 1: Update orders with past dates to status "completed"
        console.log('\n--- Updating Orders with Past Dates ---');
        const now = new Date();

        // First, let's check a sample order to see the date format
        const sampleOrder = await ordersCollection.findOne({});
        if (sampleOrder) {
            console.log(`Sample order checkOut type: ${typeof sampleOrder.checkOut}`);
            console.log(`Sample order checkOut value: ${sampleOrder.checkOut}`);
        }

        // Find all orders where checkout date has passed and status is not "completed"
        // Handle both string dates and Date objects
        const ordersToCheck = await ordersCollection.find({
            status: { $ne: 'completed' }
        }).toArray();

        let completedCount = 0;

        for (const order of ordersToCheck) {
            if (order.checkOut) {
                const checkOutDate = new Date(order.checkOut);
                if (checkOutDate < now) {
                    await ordersCollection.updateOne(
                        { _id: order._id },
                        { $set: { status: 'completed' } }
                    );
                    completedCount++;
                    console.log(`  Updated order ${order._id} to completed (checkout: ${checkOutDate.toISOString()})`);
                }
            }
        }

        console.log(`✓ Updated ${completedCount} orders to status "completed"`);

        // Part 2: Update order.stay.imgUrl from the referenced stay's imgUrls
        console.log('\n--- Updating Order Stay Images ---');

        const allOrders = await ordersCollection.find({
            'stay._id': { $exists: true }
        }).toArray();

        console.log(`Found ${allOrders.length} orders with stay reference`);

        let orderStaysUpdated = 0;

        for (const order of allOrders) {
            if (order.stay && order.stay._id) {
                // Find the corresponding stay in the stay collection
                // Convert stay._id to ObjectId if it's a string
                const stay = await staysCollection.findOne({
                    _id: typeof order.stay._id === 'string'
                        ? new ObjectId(order.stay._id)
                        : order.stay._id
                });

                if (stay && stay.imgUrls && stay.imgUrls.length > 0) {
                    // Get the first image from the stay's imgUrls array
                    const firstImgUrl = stay.imgUrls[0];

                    // Update order.stay.imgUrl if it's missing or different
                    if (!order.stay.imgUrl || order.stay.imgUrl !== firstImgUrl) {
                        await ordersCollection.updateOne(
                            { _id: order._id },
                            { $set: { 'stay.imgUrl': firstImgUrl } }
                        );
                        orderStaysUpdated++;
                        console.log(`  Updated order ${order._id}: stay.imgUrl = ${firstImgUrl}`);
                    }
                } else {
                    console.log(`  ⚠ Stay not found or has no images for order ${order._id}, stay._id: ${order.stay._id}`);
                }
            }
        }

        console.log(`✓ Updated ${orderStaysUpdated} order stay images`);

        console.log('\n=== Migration Complete ===');
        console.log(`Total orders updated to completed: ${completedCount}`);
        console.log(`Total order stay images updated: ${orderStaysUpdated}`);

    } catch (err) {
        console.error('Migration failed:', err);
        throw err;
    } finally {
        await client.close();
        console.log('\nDatabase connection closed');
    }
}

// Run the migration
migrateOrders()
    .then(() => {
        console.log('\n✓ Script finished successfully');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n✗ Script failed:', err);
        process.exit(1);
    });
