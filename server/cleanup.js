const { deleteOldWebhooks } = require('./db');

const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS, 10) || 90;
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function runCleanup() {
  try {
    const deletedCount = await deleteOldWebhooks(RETENTION_DAYS);
    if (deletedCount > 0) {
      console.log(`Cleanup: Deleted ${deletedCount} webhooks older than ${RETENTION_DAYS} days`);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

function startCleanupJob() {
  // Run immediately on startup
  runCleanup();

  // Schedule to run every 24 hours
  setInterval(runCleanup, CLEANUP_INTERVAL_MS);

  console.log(`Cleanup job scheduled: Removing webhooks older than ${RETENTION_DAYS} days`);
}

module.exports = { startCleanupJob, runCleanup };
