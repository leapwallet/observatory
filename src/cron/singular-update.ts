import * as cron from 'node-cron';
import { generateSingularChainNodeList } from './helpers/generate-chain-nodes';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateChainDataInDb() {
  try {
    const chainNodeList = await generateSingularChainNodeList();
    const jsonData = JSON.stringify(chainNodeList);

    // Check if the record already exists
    const existingRecord = await prisma.meta.findUnique({
      where: {
        key: 'singular_chain_data',
      },
    });

    if (existingRecord) {
      // If it exists, update the record
      await prisma.meta.update({
        where: {
          key: 'singular_chain_data',
        },
        data: {
          value: jsonData,
          updatedAt: new Date(),
        },
      });
    } else {
      // If not, create a new record
      await prisma.meta.create({
        data: {
          key: 'singular_chain_data',
          value: jsonData,
        },
      });
    }

    console.log('Singular Chain data updated successfully.');
  } catch (error) {
    console.error('Failed to update chain data:', error);
  }
}

updateChainDataInDb();

// Schedule the task to run once a day at midnight ('0 0 * * *')
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled task to update chain data...');
  updateChainDataInDb();
});
