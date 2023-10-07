#!/bin/bash

cd /contracts
npm install -g npm@10.0.0
npm i
cd /backend
npm i
npm run start:dev
