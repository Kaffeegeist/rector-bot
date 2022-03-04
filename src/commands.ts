import { MessageEmbed } from "discord.js";
import CommandHandler from "./commandhandler";
import { GuildHandler } from "./guildhandler";

const cmds = new CommandHandler();
const guildHandler = new GuildHandler();

cmds.registerCommand(
    "help",
    "displays this help box",
    async (_client, message) => {
        // create a new embed
        const embed = new MessageEmbed().setColor("BLUE").setTitle("Help");

        // add a new field for each command that is registered
        cmds.commands.forEach((command) =>
            embed.addField(`\`${command.name}\``, command.description),
        );

        // reply to the user with the embed
        await message.reply({ embeds: [embed] });
    },
);

cmds.registerCommand(
    "bind",
    "makes this channel the main channel for the bot",
    async (_client, message) => {
        if (!message.channel.isText() || message.channel.isThread()) {
            await message.reply(
                "Dieser Kanal ist kein gewöhnlicher Text-Kanal",
            );
            return;
        }
        const options = guildHandler.getOptions(message.guild);
        options.botChannelId = message.channelId;
        await message.reply(
            `<#${message.channelId}> wurde als Hauptkanal gesetzt`,
        );
    },
);

export { cmds, guildHandler };
