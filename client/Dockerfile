# Filename: frontend/Dockerfile

# --- Stage 1: Build the React Application ---
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# --- FIX: Use 'npm run build' to create the production files ---
RUN npm run build

# --- Stage 2: Serve the Application with Nginx ---
FROM nginx:1.25-alpine

# This command will now work because the '/app/build' folder was created
COPY --from=builder /app/build /usr/share/nginx/html

# Copy your custom Nginx configuration.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the Nginx web server.
EXPOSE 80

# Command to start Nginx.
CMD ["nginx", "-g", "daemon off;"]