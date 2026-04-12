# 1. Use a super lightweight version of Node.js
FROM node:22-alpine

# 2. Create the working directory inside the container
WORKDIR /app

# 3. Copy only the package files first (this caches dependencies so builds are faster)
COPY package*.json ./

# 4. Install all dependencies
RUN npm install

# 5. Copy the rest of your backend code into the container
COPY . .

# 6. Compile your TypeScript code into plain JavaScript
RUN npm run build

# 7. Expose the port your backend runs on (usually 5000 or 3000)
EXPOSE 5000

# 8. The command to start your server
CMD ["npm", "start"]