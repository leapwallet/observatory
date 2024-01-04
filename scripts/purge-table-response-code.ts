import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function purgeRecords() {
  try {
    // Connect to the PostgreSQL database
    await prisma.$connect();

    // Execute the Prisma delete query to purge the records
    await prisma.responseCode.deleteMany();

    console.log('Records purged successfully.');
  } catch (error) {
    console.error('Error purging records:', error);
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

// Call the purgeRecords() function to initiate the purge
purgeRecords();
