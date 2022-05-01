<div align="center">
    <img src="./media/icon.png" width="300px" style="border-radius: 50%; border: 5px solid black;">
    <h1>rector bot</h1>
    <p>A discord bot for pushing new notifications about [our](https://github.com/Kaffeegeist) timetable</p>
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

```
$ npm run br
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
