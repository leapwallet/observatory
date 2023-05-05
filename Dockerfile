FROM node:16 AS observatory
WORKDIR /app
COPY . .
RUN corepack enable
RUN yarn
RUN yarn build

FROM alpine:3 AS grafana-agent
WORKDIR /app
RUN wget https://github.com/grafana/agent/releases/download/v0.28.0/agent-linux-amd64.zip
RUN unzip agent-linux-amd64.zip
RUN chmod a+x agent-linux-amd64

FROM node:16
WORKDIR /app
COPY --from=observatory /app/dist/ dist
COPY --from=observatory /app/node_modules/ node_modules
COPY --from=observatory /app/package.json .
COPY --from=observatory /app/src/chainNodeList.json ./dist/
COPY --from=observatory /app/prisma prisma
COPY grafana-agent.yaml .
COPY --from=grafana-agent /app/agent-linux-amd64 .
COPY cmd.sh .
ENV PORT=3000 NODE_ENV=prod
EXPOSE $PORT
HEALTHCHECK \
    CMD curl -f http://localhost:$PORT/health
CMD sh cmd.sh