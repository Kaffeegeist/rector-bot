import { MessageEmbed, NewsChannel, TextChannel } from "discord.js";
import { Entry } from "dsbmobile";
import { BOT_NAME, CONTRIBUTORS, PREFIX } from "./constants";
import CommandHandler from "./handlers/commandhandler";
import { GuildHandler } from "./handlers/guildhandler";
import { ScheduleHandler } from "./handlers/schedulehandler";

const cmds = new CommandHandler();
const guildHandler = GuildHandler.load() || new GuildHandler();

export async function sendEntryEmbeds(
    channel: TextChannel | NewsChannel,
    entries: Entry[],
) {
    const dates: Date[] = [];
    for (const entry of entries) {
        if (!dates.some((d) => d.toString() === entry.date.toString())) {
            dates.push(entry.date);
        }
    }
    const embed = new MessageEmbed()
        .setColor("YELLOW")
        .setTitle("Neue Änderungen")
        .setTimestamp(new Date());

    for (const date of dates) {
        let text = "";
        let day = "";
        for (const entry of entries.filter(
            (entry) => entry.date.toString() === date.toString(),
        )) {
            text += `${entry.period}. Stunde - ${entry.type}\n`;
            day = entry.day;
        }
        const [numDay, month] = date
            .toLocaleDateString("de-DE", {
                month: "long",
                day: "2-digit",
            })
            .split(".");
        embed.addField(`${day}, ${numDay}. ${month}`, text, true);
    }
    await channel.send({ embeds: [embed] });
}

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
    `setzt diesen Kanal als Hauptkanal für ${BOT_NAME}`,
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
        await message.reply(
            `:white_check_mark: <#${message.channelId}> wurde als Hauptkanal gesetzt`,
        );
        await options.scheduleHandler.update();
    },
);

cmds.registerCommand(
    "bound",
    "zeigt den aktuellen Hauptkanal an",
    async (_client, message) => {
        const options = guildHandler.getOptions(message.guildId);
        if (options.botChannelId) {
            await message.reply(
                `<#${options.botChannelId}> ist der Hauptkanal`,
            );
        } else {
            await message.reply(
                `Es ist kein Hauptkanal gesetzt. Benutze \`${PREFIX}bind\` um ihn zu setzen`,
            );
        }
    },
);

cmds.registerCommand(
    "unbind",
    "entfernt diesen Kanal",
    async (_client, message) => {
        if (!guildHandler.guildOptionsMap.has(message.guildId)) {
            await message.reply(
                `:x: Es wurde kein Kanal gesetzt. Rufe \`${PREFIX}help\` auf für Hilfe`,
            );
            return;
        }
        guildHandler.removeGuild(message.guildId);
        await message.reply(":white_check_mark:");
    },
);

cmds.registerCommand(
    "about",
    `zeigt Informationen über ${BOT_NAME} an`,
    async (_client, message) => {
        // create a new embed
        const embed = new MessageEmbed()
            .setColor("LUMINOUS_VIVID_PINK")
            .setTitle("Über")
            .addField(
                "Entwickler",
                Array.from(CONTRIBUTORS.entries())
                    .map(([name, link]) => `**${name}**: ${link}`)
                    .join("\n"),
            )
            .addField(
                "Quellcode auf GitHub",
                "https://github.com/Kaffeegeist/rector-bot",
            );
        message.channel.send({ embeds: [embed] });
    },
);

export { cmds as commandHandler, guildHandler };
