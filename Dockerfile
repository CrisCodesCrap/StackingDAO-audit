FROM node:20.12-alpine AS builder

USER node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node . .
# Building the production-ready application code - alias to 'nest build'
RUN yarn install --production && yarn workspace stacks-listener build

FROM node:20.12-alpine

USER node

WORKDIR /home/node/app

COPY --from=builder --chown=node /home/node/app/node_modules ./node_modules
# Copying the production-ready application code, so it's one of few required artifacts
COPY --from=builder --chown=node /home/node/app/dist ./dist
COPY --from=builder --chown=node /home/node/app/public ./public
COPY --from=builder --chown=node /home/node/app/package.json .

CMD [ "yarn", "workspace", "stacks-listener", "start" ]