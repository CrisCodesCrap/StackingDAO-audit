FROM node:20.12-alpine AS builder

USER node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node . .
# Building the production-ready application code
RUN yarn install --production && yarn workspace stacks-listener build

FROM node:20.12-alpine

USER node

WORKDIR /home/node/app

# Copying the production-ready application code, so it's one of few required artifacts
COPY --from=builder --chown=node /home/node/app/node_modules ./node_modules
COPY --from=builder --chown=node /home/node/app/apps/stacks-listener/dist ./dist
COPY --from=builder --chown=node /home/node/app/apps/stacks-listener/package.json .

EXPOSE 3000
ENTRYPOINT [ "yarn", "start" ]