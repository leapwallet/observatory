import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deletionTask() {
  try {
    console.log('\x1b[36m%s\x1b[0m', '--- Deletion job started ---');
    const deleteAfterDays = 30;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - deleteAfterDays);

    const startTime = new Date();

    const deleteOldRecords = await prisma.responseCode.deleteMany({
      where: {
        createdAt: {
          lt: dateThreshold,
        },
      },
    });

    const endTime = new Date();
    const timeTaken = endTime.getTime() - startTime.getTime();

    console.log(
      `${deleteOldRecords.count} records older than ${deleteAfterDays} days were deleted in ${timeTaken} ms.`,
    );
    console.log('\x1b[32m%s\x1b[0m', '--- Deletion job ended ---');
  } catch (e) {
    if (e instanceof Error) {
      console.error('\x1b[31m%s\x1b[0m', `Error occurred: ${e.message}`);
    } else {
      console.error('\x1b[31m%s\x1b[0m', 'An unknown error occurred');
    }
  }
}

// Run the task at startup
deletionTask();

// Schedule the task to run every 24 hours (at midnight)
cron.schedule('0 0 * * *', () => {
  deletionTask();
});
