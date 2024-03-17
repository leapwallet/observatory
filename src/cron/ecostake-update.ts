// updateEcostakeChainData.ts
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();
import axios from 'axios';

const url = 'https://assets.leapwallet.io/cosmos-registry/v1/chains/natively-supported-chains.json';

export async function fetchSupportedChains() {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch supported chains:', error);
    return null;
  }
}

async function updateChainDataInDb() {
  try {
    const chainNodeList = await fetchSupportedChains();
    const jsonData = JSON.stringify(chainNodeList);

    // Check if the record already exists
    const existingRecord = await prisma.meta.findUnique({
      where: {
        key: 'ecostake_chain_data',
      },
    });

    if (existingRecord) {
      // If it exists, update the record
      await prisma.meta.update({
        where: {
          key: 'ecostake_chain_data',
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
          key: 'ecostake_chain_data',
          value: jsonData,
        },
      });
    }

    console.log('Ecostake chain data updated successfully.');
  } catch (error) {
    console.error('Failed to update Ecostake chain data:', error);
  }
}

// Schedule the task to run once a day at midnight ('0 0 * * *')
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled task to update Ecostake chain data...');
  updateChainDataInDb();
});

// Initial call or you can remove it if you want to strictly follow the schedule
updateChainDataInDb();
