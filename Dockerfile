FROM node
RUN mkdir /app
RUN chown node /app
USER node
COPY package.json /app
WORKDIR /app
RUN npm install
COPY . /app
CMD ["npm", "run", "dev"]
