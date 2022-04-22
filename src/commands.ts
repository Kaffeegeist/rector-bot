import { MessageEmbed } from "discord.js";
import CommandHandler from "./handlers/commandhandler";
import { GuildHandler } from "./handlers/guildhandler";
import { ScheduleHandler } from "./handlers/schedulehandler";
import { sendEntryEmbeds } from "./utility";

const cmds = new CommandHandler();
const guildHandler = GuildHandler.load() || new GuildHandler();

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
    "setzt diesen Kanal als Hauptkanal für diesen Bot",
    async (_client, message) => {
        if (!message.channel.isText() || message.channel.isThread()) {
            await message.reply(
                ":x: Dieser Kanal ist kein gewöhnlicher Text-Kanal",
            );
            return;
        } else if (
            guildHandler.getOptions(message.guildId).botChannelId ===
            message.channelId
        ) {
            await message.reply(":x: Dieser Kanal ist bereits gesetzt");
            return;
        }
        const options = guildHandler.getOptions(message.guildId);
        options.botChannelId = message.channelId;
        options.scheduleHandler ??= new ScheduleHandler(
            process.env.DSB_USERNAME,
            process.env.DSB_PASSWORD,
            "TGI11/4",
        );
        options.scheduleHandler.onUpdate(async (entries) => {
            // @ts-ignore
            await sendEntryEmbeds(message.channel, entries);
        });
        guildHandler.setOptions(message.guildId, options);
        await options.scheduleHandler.update();
        await message.reply(
            `:white_check_mark: <#${message.channelId}> wurde als Hauptkanal gesetzt`,
        );
    },
);

cmds.registerCommand(
    "unbind",
    "entfernt diesen Kanal",
    async (_client, message) => {
        if (!guildHandler.guildOptionsMap.has(message.guildId)) {
            await message.reply(
                ":x: Es wurde kein Kanal gesetzt. Rufe `/help` auf für Hilfe",
            );
            return;
        }
        guildHandler.removeGuild(message.guildId);
        await message.reply(":white_check_mark:");
    },
);

export { cmds, guildHandler };
