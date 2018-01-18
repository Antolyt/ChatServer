FROM node:7
WORKDIR /app
COPY package.json /app
RUN npm install
COPY server.js /app
COPY public/* /app/public/
CMD node server.js
EXPOSE 3000