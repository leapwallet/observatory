// updateEcostakeChainData.ts
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
// @ts-ignore
import axios from 'axios';
import { EnvVars } from '../env-vars';

const prisma = new PrismaClient();

async function dataAccuracyCheck() {
  console.log('Running data accuracy check...');
  const rawData = await prisma.$queryRaw`
    WITH DataPoints AS (
      SELECT
        chain_id,
        type,
        url,
        COUNT(*) AS total_data_points,
        60 AS expected_data_points,
        (COUNT(*)::FLOAT / 60) * 100 AS data_percentage
      FROM
        response_codes
      WHERE
        "createdAt" >= NOW() - INTERVAL '60 minutes'
      GROUP BY
        chain_id, type, url
    ),
    SufficientHistory AS (
      SELECT
        chain_id,
        type,
        url
      FROM
        response_codes
      WHERE
        "createdAt" <= NOW() - INTERVAL '2 hours'
      GROUP BY
        chain_id, type, url
    ),
    FilteredDataPoints AS (
      SELECT
        dp.*
      FROM
        DataPoints dp
      WHERE
        EXISTS (
          SELECT 1
          FROM SufficientHistory sh
          WHERE
            sh.chain_id = dp.chain_id
            AND sh.type = dp.type
            AND sh.url = dp.url
        )
    )
    SELECT
      chain_id,
      type,
      url,
      total_data_points,
      expected_data_points,
      data_percentage
    FROM
      FilteredDataPoints
    WHERE
      data_percentage < 80
    ORDER BY
      data_percentage ASC;
  `;

  if ((rawData as any[]).length > 100) {
    // @ts-ignore
    const message = {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*NMS P1 Last One Hour Downtime Alert*',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'At least one chain has experienced downtime in the last hour. Immediate attention required.',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `For more details, see the <https://metabase.leapwallet.io/question/287-d-nms-p1-last-one-hour-downtime-check|report>.`,
          },
        },
      ],
      attachments: [
        {
          color: '#FFA1A1', // Light red color
          blocks: [
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: ':information_source: Please review the report and take necessary actions.',
                },
              ],
            },
          ],
        },
      ],
    };

    try {
      console.log('Env : ' + EnvVars.getNodeEnv());
      if (EnvVars.getNodeEnv() === 'prod') {
        const response = await axios.post(
          'https://hooks.slack.com/services/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',
          message,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (response.status !== 200) {
          console.error('Failed to send message to Slack:', response.data);
        } else {
          console.log('Message sent to Slack successfully.');
        }
      }
    } catch (error: any) {
      console.error('Failed to send message to Slack:', error.response ? error.response.data : error.message);
    }
  } else {
    console.log(
      `Data accuracy check complete. ${(rawData as any[]).length} records found with data percentage below 80%.`,
    );
  }
}

// Schedule the task to run once a day at midnight ('0 0 * * *')
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled task to verify data accuracy...');
  dataAccuracyCheck();
});

// Initial call or you can remove it if you want to strictly follow the schedule
dataAccuracyCheck();
