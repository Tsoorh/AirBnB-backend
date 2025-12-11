import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

// Configuration
const DB_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'airbnb_db';

async function renameHostPicture() {
    const client = new MongoClient(DB_URL);

    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected successfully!');

        const db = client.db(DB_NAME);
        const staysCollection = db.collection('stay');

        console.log('\n--- Renaming host.picture to host.imgUrl ---');

        // Find all stays with host.picture field
        const staysWithPicture = await staysCollection.find({
            'host.picture': { $exists: true }
        }).toArray();

        console.log(`Found ${staysWithPicture.length} stays with host.picture field`);

        let updatedCount = 0;

        for (const stay of staysWithPicture) {
            if (stay.host && stay.host.picture) {
                // Rename the field from picture to imgUrl
                await staysCollection.updateOne(
                    { _id: stay._id },
                    {
                        $set: { 'host.imgUrl': stay.host.picture },
                        $unset: { 'host.picture': '' }
                    }
                );
                updatedCount++;
                console.log(`✓ Updated stay ${stay._id}: host.picture → host.imgUrl (${stay.host.picture})`);
            }
        }

        console.log(`\n✓ Updated ${updatedCount} stays`);

        console.log('\n=== Migration Complete ===');
        console.log(`Total stays with host.picture: ${staysWithPicture.length}`);
        console.log(`Total stays updated: ${updatedCount}`);

    } catch (err) {
        console.error('Migration failed:', err);
        throw err;
    } finally {
        await client.close();
        console.log('\nDatabase connection closed');
    }
}

// Run the migration
renameHostPicture()
    .then(() => {
        console.log('\n✓ Script finished successfully');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n✗ Script failed:', err);
        process.exit(1);
    });
