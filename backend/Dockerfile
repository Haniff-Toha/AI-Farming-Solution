FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm install
COPY . .
# EXPOSE 8080
EXPOSE 5001
CMD ["npm", "start"]


