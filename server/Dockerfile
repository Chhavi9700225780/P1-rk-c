# Filename: backend/Dockerfile

# --- Stage 1: Base Image ---
# Use an official, lightweight Node.js image. 'alpine' is a small Linux distribution.
FROM node:18-alpine

# --- Stage 2: Setup Application ---
# Set the working directory inside the container. All commands will run from here.
WORKDIR /app

# Copy package.json and package-lock.json first. Docker caches this layer,
# so 'npm install' only runs again if these files change, speeding up future builds.
COPY package*.json ./

# Install application dependencies.
RUN npm install

# --- Stage 3: Copy Code and Run ---
# Copy the rest of your backend source code into the container.
COPY . .

# Expose the port your Express server is listening on.
# Change 5000 if your server uses a different port.
EXPOSE 5000

# The command that will be executed when the container starts.
# This runs your main server file.
CMD [ "node", "index.js" ]