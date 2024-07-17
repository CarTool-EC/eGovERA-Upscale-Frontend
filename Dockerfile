# Use a NodeJS base image
FROM node:18-alpine

# Install yarn and eUI
RUN npm install -g @eui/cli@17.2.3

# Zscaler fix
COPY cacert.pem /etc/ssl/certs/cacert.pem
RUN yarn config set cafile /etc/ssl/certs/cacert.pem
RUN yarn config list

# Set working directory
WORKDIR /upscale-frontend

# Copy package and npmrc files
COPY yarn.lock ./
COPY package.json ./

# Install and update packages
RUN yarn install

# After installing packages, copy all app files
COPY ./ ./

#It can be modified in Angular.json
EXPOSE 4200

# Execute command
CMD ["npm", "run", "prod"]

