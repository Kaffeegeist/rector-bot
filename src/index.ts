import { Client, Intents } from "discord.js";
import commandHandler from "./commands";
require("dotenv").config();

const PREFIX = "=";
const client = new Client({
    // GUILD = Discord Server
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", () => {
    console.log(client.user.tag);
});

client.on("message", async (message) => {
    if (
        message.author.id === client.user.id ||
        !message.content.toLowerCase().startsWith(PREFIX)
    )
        return;

    await commandHandler.handleCommand(client, message, PREFIX);
});

client.login(process.env.token);
