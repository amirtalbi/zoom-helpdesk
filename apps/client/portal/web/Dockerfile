FROM docker.io/node:lts-alpine as runner
RUN apk add --no-cache dumb-init
ENV NODE_ENV production
ENV PORT 3000
WORKDIR /app
COPY dist/apps/client/portal/web/.output .
RUN npm install -C /app/server --only=production
RUN chown -R node:node .
USER node
EXPOSE 3000
CMD ["dumb-init", "node", "server/index.mjs"]
