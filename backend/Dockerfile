# Use a lightweight version of Node.js
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies FIRST (this saves build time!)
COPY package*.json ./
RUN npm install

# Copy the rest of your backend code into the container
COPY . .

# Compile TypeScript to JavaScript (Assuming you have a "build" script in package.json)
RUN npm run build

# Expose the port your server runs on
EXPOSE 5000

# The command to start your server (Assuming you have a "start" script)
CMD ["npm", "start"]