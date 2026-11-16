FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && npm install --omit=dev && apt-get purge -y python3 make g++ && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*
COPY . .
ENV NODE_ENV=production DATA_DIR=/app/data PORT=3000
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["npm", "start"]
