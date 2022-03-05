import { MessageEmbed } from "discord.js";
import CommandHandler from "./handlers/commandhandler";
import { GuildHandler } from "./handlers/guildhandler";
import { ScheduleHandler } from "./handlers/schedulehandler";
import { sendEntryEmbeds } from "./utility";

const cmds = new CommandHandler();
const guildHandler = new GuildHandler();

cmds.registerCommand(
    "help",
    "zeigt diese Hilfe an",
    async (_client, message) => {
        // create a new embed
        const embed = new MessageEmbed().setColor("BLUE").setTitle("Hilfe");

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
    "macht den Kanal in dem es geschrieben wurde zum Hauptkanal für diesen Bot",
    async (_client, message) => {
        if (!message.channel.isText() || message.channel.isThread()) {
            await message.reply(
                "Dieser Kanal ist kein gewöhnlicher Text-Kanal",
            );
            return;
        }
        const options = guildHandler.getOptions(message.guildId);
        options.botChannelId = message.channelId;
        options.scheduleHandler = new ScheduleHandler(
            process.env.DSB_USERNAME,
            process.env.DSB_PASSWORD,
            "TGI11/4",
        );
        options.scheduleHandler.updateCallback = async (entries) => {
            await sendEntryEmbeds(message, entries);
        };
        guildHandler.setOptions(message.guildId, options);
        await options.scheduleHandler.update();
        await message.reply(
            `<#${message.channelId}> wurde als Hauptkanal gesetzt`,
        );
    },
);

export { cmds, guildHandler };
