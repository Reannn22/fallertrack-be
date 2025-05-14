# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Expose the port your app will listen on (default 8080 for Cloud Run)
EXPOSE 8080

# Set environment variable for the port
ENV PORT 8080

# Start the app using the command that runs the Express app
CMD ["node", "index.js"]
