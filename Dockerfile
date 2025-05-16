# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Create directory for credentials with proper permissions
RUN mkdir -p /app/secrets && \
    chown -R node:node /app/secrets && \
    chmod 700 /app/secrets

# Copy service account credentials
COPY credentials/service-account.json /app/secrets/
RUN chown node:node /app/secrets/service-account.json && \
    chmod 600 /app/secrets/service-account.json

# Set environment variables
ENV GOOGLE_APPLICATION_CREDENTIALS="/crdentials/database-firebase-adminsdk-fbsvc-5ed10a17ab.json"
ENV NODE_ENV="production"

# Install dependencies inside the container
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Expose the port your app will listen on (default 8080 for Cloud Run)
EXPOSE 8080

# Set environment variable for the port
ENV PORT 8080

# Switch to non-root user
USER node

# Start the app using the command that runs the Express app
CMD ["node", "index.js"]
