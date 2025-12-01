FROM node:24-slim

WORKDIR /app

# copy package manifests first to leverage docker cache
COPY package.json package-lock.json ./

# use legacy-peer-deps to avoid peer-conflict issues during install
RUN npm ci --legacy-peer-deps --only=production

# copy source and build
COPY . .
RUN npm run build

EXPOSE 4000
CMD ["node", "dist/index.js"]
