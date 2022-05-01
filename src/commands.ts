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
    "zeigt eine Hilfe an",
    async (_client, interaction) => {
        // create a new embed
        const embed = new MessageEmbed().setColor("BLUE").setTitle("Hilfe");

        // add a new field for each command that is registered
        cmds.commands.forEach((command) =>
            embed.addField(`\`${PREFIX}${command.name}\``, command.description),
        );

        // reply to the user with the embed
        await interaction.reply({ embeds: [embed] });
    },
);

cmds.registerCommand(
    "bind",
    `setzt diesen Kanal als Hauptkanal für ${BOT_NAME}`,
    async (_client, interaction) => {
        if (!interaction.channel.isText() || interaction.channel.isThread()) {
            await interaction.reply(
                ":x: Dieser Kanal ist kein gewöhnlicher Text-Kanal",
            );
            return;
        } else if (
            guildHandler.getOptions(interaction.guildId).botChannelId ===
            interaction.channelId
        ) {
            await interaction.reply(":x: Dieser Kanal ist bereits gesetzt");
            return;
        }
        const options = guildHandler.getOptions(interaction.guildId);
        options.botChannelId = interaction.channelId;
        options.scheduleHandler ??= new ScheduleHandler(
            process.env.DSB_USERNAME,
            process.env.DSB_PASSWORD,
            "TGI11/4",
        );
        options.scheduleHandler.onUpdate(async (entries) => {
            // @ts-ignore
            await sendEntryEmbeds(message.channel, entries);
        });
        guildHandler.setOptions(interaction.guildId, options);
        await interaction.reply(
            `:white_check_mark: <#${interaction.channelId}> wurde als Hauptkanal gesetzt`,
        );
        await options.scheduleHandler.update();
    },
);

cmds.registerCommand(
    "bound",
    "zeigt den aktuellen Hauptkanal an",
    async (_client, interaction) => {
        const options = guildHandler.getOptions(interaction.guildId);
        if (options.botChannelId) {
            await interaction.reply(
                `Der Hauptkanal ist <#${options.botChannelId}>`,
            );
        } else {
            await interaction.reply(
                `Es ist kein Hauptkanal gesetzt. Benutze \`${PREFIX}bind\` um ihn zu setzen`,
            );
        }
    },
);

cmds.registerCommand(
    "unbind",
    "entfernt diesen Kanal",
    async (_client, interaction) => {
        if (!guildHandler.guildOptionsMap.has(interaction.guildId)) {
            await interaction.reply(
                `:x: Es wurde kein Kanal gesetzt. Rufe \`${PREFIX}help\` auf für Hilfe`,
            );
            return;
        }
        guildHandler.removeGuild(interaction.guildId);
        await interaction.reply(":white_check_mark:");
    },
);

cmds.registerCommand(
    "about",
    `zeigt Informationen über ${BOT_NAME} an`,
    async (_client, interaction) => {
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
        interaction.channel.send({ embeds: [embed] });
    },
);

export { cmds as commandHandler, guildHandler };
