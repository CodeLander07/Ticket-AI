FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --production
COPY . .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "src/index.js"]


