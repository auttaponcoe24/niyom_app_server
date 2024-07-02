# Typescript Template API Service (for Orbix Trade)


[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

เขียนโดยใช้ Node JS (Express) Prisma และใช้ PostgreSQL  เป็น Database

## Features

- Build in Swagger API Documents
- ESLint and Prettierrc
- Docker and Compose
- PM2 (if run on non docker)

## Installation

โปรดใช้ [Node.js](https://nodejs.org/) v18+ ขี้นไป.

Install the dependencies and devDependencies and start the server.

```sh
cp .env.development.local.example .env.development.local
yarn install
yarn dev
```

For production environments...

```sh
cp .env.production.local.example .env.production.local
yarn install
yarn start
```


## License
MIT
