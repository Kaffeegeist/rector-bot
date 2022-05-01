# rector bot

A discord bot for pushing new notifications about our timetable

## Setting up

### Using [docker](https://docker.com)

`docker-compose.yml`

```yml
version: "3.8"

services:
    rector-bot:
        image: tch1b0/rector:latest
        environment:
            - BOT_TOKEN=<YOUR DISCORD BOT TOKEN>
            - DSB_USERNAME=<YOUR DSBmobile USERNAME>
            - DSB_PASSWORD=<YOUR DSBmobile USERNAME>

        # optionally for data consistency:
        volumes:
            - "./data:/app/data"
```

## npm scripts

Usage: `npm run <script>`

-   `build`
    builds the project

-   `start`
    runs the compiled project

## Built with

-   [typescript](https://www.typescriptlang.org/)
-   [discord.js](https://discord.js.org/)
-   [dsbmobile.js](https://github.com/Tch1b0/dsbmobile.js)
