<div align="center">
    <img src="./media/icon.png" width="300px">
    <h1>Rector</h1>
    <img src="https://img.shields.io/github/license/Kaffeegeist/rector-bot">
    <img src="https://img.shields.io/github/actions/workflow/status/Kaffeegeist/rector-bot/ci.yml?branch=main&label=ci">
    <p>A discord bot for staying up to date with the <a href="https://dsbmobile.de">dsbmobile</a> substitution plan</p>
</div>

## Setting up

### Using [docker](https://docker.com)

`docker-compose.yml`

```yml
version: "3.8"

services:
    bot:
        image: tch1b0/rector:latest
        environment:
            - BOT_TOKEN=<YOUR DISCORD BOT TOKEN>
            - DSB_USERNAME=<YOUR DSBmobile USERNAME>
            - DSB_PASSWORD=<YOUR DSBmobile USERNAME>
            - CLASS_NAME=<YOUR CLASS NAME>

        # optionally for data consistency:
        volumes:
            - "./data:/app/data"
```

```bash
$ docker-compose pull
```

```bash
$ docker-compose up -d
```

You can optionally create a [config file](https://github.com/Kaffeegeist/rector-bot/tree/main/example/data/config.json) in `data/config.json`

### Building from source

```bash
$ git clone https://github.com/Kaffeegeist/rector-bot
```

```bash
$ cd ./rector-bot
```

Now create the file `.env` and declare following variables:

```
BOT_TOKEN
DSB_USERNAME
DSB_PASSWORD
CLASS_NAME
```

```bash
$ npm ci
```

```bash
$ npm run br
```

## npm scripts

Usage: `npm run <script>`

-   `build`
    builds the project

-   `start`
    runs the compiled project

-   `br`
    builds and runs the project

## Built with

-   [TypeScript](https://www.typescriptlang.org/)
-   [discord.js](https://discord.js.org/)
-   [dsbmobile.js](https://github.com/Tch1b0/dsbmobile.js)
