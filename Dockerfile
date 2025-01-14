# ใช้ Node.js เวอร์ชัน 20 เป็น base image
FROM node:20-slim as build-stage

# ติดตั้ง OpenSSL และ dependencies
RUN apt-get update -y && apt-get install -y openssl

# สร้าง app directory
WORKDIR /app

# คัดลอกไฟล์ package.json และ yarn.lock
COPY package.json yarn.lock ./

# ติดตั้ง dependencies
RUN yarn install

# คัดลอกไฟล์ทั้งหมดในโปรเจกต์
COPY . .

# Generate Prisma Client และ build application
RUN yarn prisma generate && yarn build:alias

# ใช้ image แบบเบาเพื่อรัน production (multi-stage build)
# FROM node:20-slim as production-stage

# สร้าง app directory
# WORKDIR /app

# คัดลอก dependencies จาก build-stage
# COPY --from=build-stage /app/node_modules ./node_modules

# คัดลอกไฟล์ที่จำเป็น
# COPY --from=build-stage /app/dist ./dist
# COPY --from=build-stage /app/prisma ./prisma
# COPY --from=build-stage /app/package.json ./package.json

# เปิดพอร์ต 8000 สำหรับ container ต้องตรงกับ port project
EXPOSE 8000

# กำหนด environment เป็น production
# ENV NODE_ENV=production

# รันแอปพลิเคชันในโหมด production
CMD ["yarn", "run", "start"]
