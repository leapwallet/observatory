#!/usr/bin/env sh

if [ "$GRAFANA_CLOUD_ENABLED" = 'true' ]
then
  printf 'Telemetry will be sent to Grafana Cloud since it''s been enabled.\n'
  ./agent-linux-amd64 -config.expand-env -config.file=grafana-agent.yaml & yarn start
else
  printf 'Telemetry will not be sent to Grafana Cloud since it''s been disabled.\n'
  yarn start
fi
