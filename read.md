<!-- สร้างไฟล์ Dockerfile สำหรับ Node.js Application -->

# ใช้ Node.js official image

FROM node:14

# ตั้ง working directory

WORKDIR /usr/src/app

# Copy ไฟล์ package.json และ package-lock.json

COPY package\*.json ./

# ติดตั้ง dependencies

RUN npm install

# Copy โค้ดของ application

COPY . .

# เปิดพอร์ต 3000

EXPOSE 3000

# รัน application

CMD ["node", "app.js"]

<!-- สร้างไฟล์ Docker Compose -->
<!-- docker-compose.yml -->

# ใช้ Node.js official image

FROM node:14

# ตั้ง working directory

WORKDIR /usr/src/app

# Copy ไฟล์ package.json และ package-lock.json

COPY package\*.json ./

# ติดตั้ง dependencies

RUN npm install

# Copy โค้ดของ application

COPY . .

# เปิดพอร์ต 3000

EXPOSE 3000

# รัน application

CMD ["node", "app.js"]
