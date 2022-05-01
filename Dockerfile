FROM node:current-alpine


# ===[ PREPARE BUILD ]===

WORKDIR /app

# copy the files needed for building the project into /app/building
COPY ./src ./building/src
COPY ./package.json ./building/package.json
COPY ./package-lock.json ./building/package-lock.json
COPY ./tsconfig.json ./building/tsconfig.json

ENV NODE_ENV=production


# ===[ RUN BUILD ]===

# cd into the /building directory and build the project
RUN cd ./building
RUN npm ci
RUN npm run build
# move the output outside the /building directory
RUN mv ./dist ../dist
RUN cd ..
# Delete the /building directory
RUN rm -rf ./building

CMD ["npm", "start"]
