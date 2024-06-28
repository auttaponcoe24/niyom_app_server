# ใช้ base image ที่มี Node.js เวอร์ชั่นที่ต้องการ
# FROM node:18

# ตั้งค่าตัวแปรสภาพแวดล้อม
# ENV NODE_ENV=production

# สร้าง directory สำหรับโปรเจกต์
# WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json (ถ้ามี) ไปยัง container
# COPY package*.json ./

# ติดตั้ง dependencies
# RUN yarn install

# คัดลอกไฟล์โปรเจกต์ทั้งหมดไปยัง container
# COPY . .

# ระบุ port ที่แอปพลิเคชันจะใช้
# EXPOSE 3000

# คำสั่งเริ่มต้นในการรันแอปพลิเคชัน
# CMD ["node", "app.js"]

FROM node:18

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 8800

CMD ["yarn", "start"]


