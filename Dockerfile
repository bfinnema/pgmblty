# Dockerfile
FROM nikolaik/python-nodejs:python3.7-nodejs10
# Create app directory
WORKDIR /var/www/opennet
# Install app dependencies
COPY package*.json ./
RUN npm install
# Copy app source code
COPY . .
#Expose port and start application
EXPOSE 3010
CMD [ "npm", "start" ]