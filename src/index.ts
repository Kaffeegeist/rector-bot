import { Client, Intents } from "discord.js";
import Dsbmobile, { Entry, TimeTable } from "dsbmobile";
import { OutputFileType } from "typescript";
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

    message.reply(`Du hast ${message.content} gesagt! Wie konntest du nur?`);
});
