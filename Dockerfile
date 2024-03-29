FROM node:current-alpine


# ===[ PREPARE BUILD ]===

WORKDIR /app/building

# copy the files needed for building the project into /app/building
COPY ./src ./src
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./tsconfig.json ./tsconfig.json

ENV NODE_ENV=production


# ===[ RUN BUILD ]===

# build the project
RUN npm ci
RUN npm run build
# move the output outside the /building directory
RUN mv ./dist ../dist
RUN mv ./node_modules ../node_modules
# delete the /building directory
WORKDIR /app
RUN rm -rf ./building

CMD ["node", "./dist/index.js"]
