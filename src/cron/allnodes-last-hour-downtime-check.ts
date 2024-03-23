import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import axios from 'axios';
import { EnvVars } from '../env-vars';

const prisma = new PrismaClient();

async function lastHourDowntimeP0ChainsCheck() {
  console.log('Running All Nodes Last One Hour Downtime P0 Chains Check...');

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
        AND provider = 'all_nodes'
        AND "chainPriority" = 0
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
          WHEN (failed_requests::FLOAT / total_requests) * 100 > 5 THEN 'Yes'
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
      CASE WHEN is_downtime_hour = 'Yes' THEN 1 ELSE 2 END, chain_id;
  `) as any[];

  if (rawData.some((d) => d.is_downtime_hour === 'Yes')) {
    const affectedChains = rawData
      .filter((d) => d.is_downtime_hour === 'Yes')
      .map((d) => d.chain_id)
      .join(', ');
    const message = {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*AllNodes P0 Chains Last One Hour Downtime Alert*',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `At least one chain has experienced downtime in the last hour. Immediate attention required. Affected chains: ${affectedChains}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `For more details, see the <https://metabase.leapwallet.io/question/289-d-allnodes-last-one-hour-downtime-p0-chains-check|report>.`,
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

    const slackChannelUrl = EnvVars.getSlackChannelUrl();

    if (!slackChannelUrl) {
      console.log('Slack channel URL not configured. Skipping Slack notification.');
      return; // Exit the function if the Slack URL is null
    }

    try {
      console.log('Env: ' + EnvVars.getNodeEnv());
      if (EnvVars.getNodeEnv() === 'prod') {
        const response = await axios.post(slackChannelUrl, message, {
          headers: { 'Content-Type': 'application/json' },
        });

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
    console.log('No Allnodes downtime detected in the last hour.');
  }
}

async function lastHourDowntimeP1ChainsCheck() {
  console.log('Running All Nodes Last One Hour Downtime P1 Chains Check...');

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
        AND provider = 'all_nodes'
        AND "chainPriority" = 0
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
      CASE WHEN is_downtime_hour = 'Yes' THEN 1 ELSE 2 END, chain_id;
  `) as any[];

  if (rawData.some((d) => d.is_downtime_hour === 'Yes')) {
    const affectedChains = rawData
      .filter((d) => d.is_downtime_hour === 'Yes')
      .map((d) => d.chain_id)
      .join(', ');
    const message = {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*AllNodes P1 Chains Last One Hour Downtime Alert*',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `At least one chain has experienced downtime in the last hour. Immediate attention required. Affected chains: ${affectedChains}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `For more details, see the <https://metabase.leapwallet.io/question/292-d-allnodes-last-one-hour-downtime-p1-chains-check|report>.`,
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

    const slackChannelUrl = EnvVars.getSlackChannelUrl();

    if (!slackChannelUrl) {
      console.log('Slack channel URL not configured. Skipping Slack notification.');
      return; // Exit the function if the Slack URL is null
    }

    try {
      console.log('Env: ' + EnvVars.getNodeEnv());
      if (EnvVars.getNodeEnv() === 'prod') {
        const response = await axios.post(slackChannelUrl, message, {
          headers: { 'Content-Type': 'application/json' },
        });

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
    console.log('No Allnodes downtime detected in the last hour.');
  }
}

// Schedule the task to run every hour
cron.schedule('0 * * * *', () => {
  console.log('Running scheduled task for All nodes Last One Hour Downtime P0 Chains Check...');
  lastHourDowntimeP0ChainsCheck();

  console.log('Running scheduled task for All nodes Last One Hour Downtime P1 Chains Check...');
  lastHourDowntimeP1ChainsCheck();
});
