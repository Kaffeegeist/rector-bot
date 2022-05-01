import { Client, Intents } from "discord.js";
import { cmds as commandHandler, guildHandler } from "./commands";
import { sendEntryEmbeds } from "./utility";
require("dotenv").config();

const PREFIX = "=";
const client = new Client({
    // GUILD = Discord Server
    // intent = what the bot is allowed to
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", () => {
    console.log(`Now logged in as ${client.user.tag}`);
    guildHandler.guildOptionsMap.forEach(async (options, guildId) => {
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(options.botChannelId);
        if (!channel.isText() || channel.isThread()) return;
        options.scheduleHandler.onUpdate((entries) =>
            sendEntryEmbeds(channel, entries),
        );
        await options.scheduleHandler.update();
    });
});

client.on("messageCreate", async (message) => {
    if (
        message.author.id === client.user.id ||
        !message.content.toLowerCase().startsWith(PREFIX)
    )
        return;

    await commandHandler.handleCommand(client, message, PREFIX);
});

client.login(process.env.BOT_TOKEN);
