# ใช้ Node.js 20 LTS เป็น base image
# FROM node:20-buster
FROM node:20-slim

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

# ติดตั้ง Chrome และ Puppeteer dependencies
RUN apt-get update && apt-get install -y \
  chromium \
  wget \
  curl \
  unzip \
  fonts-liberation \
  libasound2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxss1 \
  libxtst6 \
  libgbm-dev \
  gconf-service \
  xdg-utils \
  ca-certificates \
  fonts-freefont-ttf \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*


# ตั้งค่า Puppeteer ให้ใช้ Chromium ที่ติดตั้งเอง
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Generate Prisma Client และ build application
RUN yarn prisma generate && yarn build

# เปิดพอร์ต 8000 สำหรับ container ต้องตรงกับ port project
EXPOSE 8000

# รันแอปพลิเคชันในโหมด production
CMD ["yarn", "run", "start"]
