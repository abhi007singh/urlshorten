FROM node:20.12.0-alpine3.19

WORKDIR /usr/src/app

COPY babel.config.js package-lock.json package.json tsconfig.json tslint.json jest.config.ts jest.config.js jest.setup.ts ./

COPY src ./src

RUN npm install

RUN npm run build

CMD [ "npm", "run", "start" ]