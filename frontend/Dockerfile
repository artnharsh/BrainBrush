# ==========================================
# STAGE 1: BUILD THE REACT APP
# ==========================================
FROM node:22-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# 🚨 NEW: Catch the argument from docker-compose
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Compile the React app (Vite outputs to a 'dist' folder)
RUN npm run build

# ==========================================
# STAGE 2: SERVE WITH NGINX
# ==========================================
FROM nginx:alpine

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled React files from Stage 1 into Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (standard web traffic)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]