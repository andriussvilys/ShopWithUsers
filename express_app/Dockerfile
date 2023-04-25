FROM node:16
WORKDIR /express
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 80
CMD ["npm", "start"]