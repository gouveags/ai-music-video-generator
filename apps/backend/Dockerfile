FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json

RUN npm install --workspace @amvg/backend

COPY apps/backend apps/backend

WORKDIR /workspace/apps/backend

EXPOSE 8080

CMD ["npm", "run", "start"]
