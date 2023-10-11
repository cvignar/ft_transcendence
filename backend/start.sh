#!/bin/bash

cd /contracts
npm install -g npm@10.0.0
npm i
cd /backend
npm i
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev