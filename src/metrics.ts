import prometheus from 'prom-client';

export const httpRequestDurationSecondsHistogram = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration taken to fetch the latest block in seconds.',
  buckets: prometheus.linearBuckets(0.1, 0.1, 20),
  labelNames: ['chainName', 'url', 'isEcostakeUrl'] as const,
});

export const httpRequestsSucceededTotal = new prometheus.Counter({
  name: 'http_requests_succeeded_total',
  help: 'Number of successful requests made to fetch the latest block.',
  labelNames: ['chainName', 'url', 'isEcostakeUrl'] as const,
});

export const httpRequestsFailedTotal = new prometheus.Counter({
  name: 'http_requests_failed_total',
  help: 'Number of successful requests made to fetch the latest block.',
  labelNames: ['chainName', 'url', 'isEcostakeUrl'] as const,
});
