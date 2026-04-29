FROM node:18-alpine

WORKDIR /app

# Copy root package.json and install frontend dependencies
COPY package*.json ./
RUN npm install

# Copy server package.json and install backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy all source files
COPY . .

# Build the Vite frontend
RUN npm run build

# Expose the port the server runs on
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
