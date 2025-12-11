import cron from 'node-cron';
import { dbService } from './db.service.js';
import { loggerService } from './logger.service.js';

const COLLECTION = 'order';

export const orderStatusService = {
    startStatusUpdater,
    updateExpiredOrders
};

// Run every day at midnight (00:00)
// Cron format: second minute hour day month weekday
// You can adjust the schedule:
// - '0 0 * * *' = Every day at midnight
// - '0 */6 * * *' = Every 6 hours
// - '0 * * * *' = Every hour
function startStatusUpdater() {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        loggerService.info('Running scheduled order status update...');
        await updateExpiredOrders();
    });

    // Also run immediately when server starts
    loggerService.info('Order status updater initialized. Running initial check...');
    updateExpiredOrders();
}

async function updateExpiredOrders() {
    try {
        const collection = await dbService.getCollection(COLLECTION);
        const now = new Date();

        // Find all orders that should be completed
        const ordersToComplete = await collection.find({
            status: { $ne: 'completed' }
        }).toArray();

        let completedCount = 0;

        for (const order of ordersToComplete) {
            if (order.checkOut) {
                const checkOutDate = new Date(order.checkOut);

                // If checkout date has passed, mark as completed
                if (checkOutDate < now) {
                    await collection.updateOne(
                        { _id: order._id },
                        { $set: { status: 'completed' } }
                    );
                    completedCount++;
                    loggerService.info(`Auto-completed order ${order._id} (checkout: ${order.checkOut})`);
                }
            }
        }

        if (completedCount > 0) {
            loggerService.info(`✓ Auto-completed ${completedCount} expired orders`);
        } else {
            loggerService.info('No expired orders to update');
        }

        return completedCount;
    } catch (err) {
        loggerService.error("Couldn't update expired orders", err);
        throw err;
    }
}
