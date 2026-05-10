FROM node:22-bookworm-slim

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY apps/frontend/package.json apps/frontend/package.json

RUN npm install --workspace @amvg/frontend

COPY apps/frontend apps/frontend

WORKDIR /workspace/apps/frontend

EXPOSE 4321

CMD ["npm", "run", "dev"]
