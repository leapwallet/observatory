# Grafana Cloud

If you enable the Grafana Cloud integration via the [`GRAFANA_CLOUD_ENABLED` environment variable](env.md), then you can observe the system using Grafana Cloud.

## Grafana Agent

You can see Grafana Agent's configuration [here](../grafana-agent.yaml).

## Grafana

Here's a [dashboard](dashboard.json) that you can [import](https://grafana.com/docs/grafana/latest/dashboards/manage-dashboards/#import-a-dashboard) into Grafana.

## Logs

Logs are sent to Grafana Cloud Hosted Logs via log files. Log files use dates in their names because they're rotated. `<DATE>` refers to the date the file was created at. Sometimes, a suffix such as `.1` will be appended to the filename which is what `<SUFFIX>` denotes. The following log files are used:

- Log files named using the format `/app/logs/default.<DATE>.log<SUFFIX>` such as `/app/logs/default.2022-10-17.log` are used for logs explicitly generated via this microservice.
- Log files named using the formats `/app/logs/rejections.<DATE>.log<SUFFIX>` such as `/app/logs/rejections.2022-10-17.log.2` are used for unhandled exceptions.
- Log files named using the formats `/app/logs/exceptions.<DATE>.log<SUFFIX>` such as `/app/logs/exceptions.2022-10-17.log.1` are used for unhandled exceptions.

## Metrics

The following metrics are sent to Prometheus:
