import { Client, Intents } from "discord.js";
import { commandHandler, guildHandler } from "./commands";
import { sendEntryEmbeds } from "./commands";
import { serializeCommands } from "./utility";
require("dotenv").config();

const client = new Client({
    // GUILD = Discord Server
    // intent = what the bot is allowed to
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", () => {
    console.log(`Now logged in as ${client.user?.tag}`);

    const serializedCommands = serializeCommands(commandHandler);

    guildHandler.guildOptionsMap.forEach(async (options, guildId) => {
        const guild = await client.guilds.fetch(guildId);
        const channel = (await guild.channels.fetch(options.botChannelId!))!;
        // ensure that the channel is a text channel
        if (!channel.isText() || channel.isThread()) return;

        // send the commands to the channel when an update is received
        options.scheduleHandler!.onUpdate((entries) =>
            sendEntryEmbeds(channel, entries),
        );
        await options.scheduleHandler!.update();

        // register the serialized slash commands
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

client.on("guildCreate", (guild) => {
    // register the slash commands
    for (const cmd of serializeCommands(commandHandler)) {
        console.log(cmd);
        guild.commands.create(cmd);
    }
});

client.on("guildDelete", (guild) => {
    // remove the guild from the guild handler
    guildHandler.removeGuild(guild.id);
});

client.login(process.env.BOT_TOKEN);
