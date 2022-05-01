import { Client, Intents } from "discord.js";
import { commandHandler, guildHandler } from "./commands";
import { sendEntryEmbeds } from "./commands";
require("dotenv").config();

const client = new Client({
    // GUILD = Discord Server
    // intent = what the bot is allowed to
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", () => {
    console.log(`Now logged in as ${client.user.tag}`);
    const serializedCommands = Array.from(
        commandHandler.commands.entries(),
    ).map(([_, cmd]) => ({
        name: cmd.name,
        description: cmd.description,
    }));
    guildHandler.guildOptionsMap.forEach(async (options, guildId) => {
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(options.botChannelId);
        if (!channel.isText() || channel.isThread()) return;
        options.scheduleHandler.onUpdate((entries) =>
            sendEntryEmbeds(channel, entries),
        );
        await options.scheduleHandler.update();
        for (const command of serializedCommands) {
            // check whether the command is already registered
            await guild.commands.create(command);
        }
    });
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    commandHandler.handleCommand(client, interaction);
});

client.login(process.env.BOT_TOKEN);
