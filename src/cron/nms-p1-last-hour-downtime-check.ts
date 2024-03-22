import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import axios from 'axios';
import { EnvVars } from '../env-vars';

const prisma = new PrismaClient();

async function lastHourDowntimeCheck() {
  console.log('Running NMS P1 Last One Hour Downtime Check...');

  const rawData = (await prisma.$queryRaw`
    WITH LastHourRequests AS (
      SELECT
        chain_id,
        COUNT(*) AS total_requests,
        SUM(CASE WHEN "httpResponseCode" != 200 THEN 1 ELSE 0 END) AS failed_requests
      FROM
        response_codes
      WHERE
        "createdAt" >= NOW() - INTERVAL '1 hour'
        AND type = 'nms'
        AND priority = 1
      GROUP BY
        chain_id
    ),
    DowntimeHourIndicator AS (
      SELECT
        chain_id,
        total_requests,
        failed_requests,
        (failed_requests::FLOAT / total_requests) * 100 AS failure_rate_percent,
        CASE
          WHEN (failed_requests::FLOAT / total_requests) * 100 > 10 THEN 'Yes'
          ELSE 'No'
        END AS is_downtime_hour
      FROM
        LastHourRequests
    )
    SELECT
      chain_id,
      total_requests,
      failed_requests,
      failure_rate_percent,
      is_downtime_hour
    FROM
      DowntimeHourIndicator
    ORDER BY
      chain_id;
  `) as any[];

  if (rawData.some((d) => d.is_downtime_hour === 'Yes')) {
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
      console.log('Env: ' + EnvVars.getNodeEnv());
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
          console.log('Downtime alert sent to Slack successfully.');
        }
      }
    } catch (error: any) {
      console.error('Failed to send message to Slack:', error.response ? error.response.data : error.message);
    }
  } else {
    console.log('No downtime detected in the last hour.');
  }
}

// Schedule the task to run every hour
cron.schedule('0 * * * *', () => {
  console.log('Running scheduled task for NMS P1 Last One Hour Downtime Check...');
  lastHourDowntimeCheck();
});

// Initial call
lastHourDowntimeCheck();
