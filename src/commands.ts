import { MessageEmbed, NewsChannel, TextChannel } from "discord.js";
import { Entry } from "dsbmobile";
import { Config } from "./config";
import { BOT_NAME, CONTRIBUTORS, PREFIX } from "./constants";
import { CommandHandler } from "./handlers/commandhandler";
import { GuildHandler, GuildOptions } from "./handlers/guildhandler";
import { ScheduleHandler } from "./handlers/schedulehandler";

const config = Config.instance;
const cmds = new CommandHandler();
const guildHandler = GuildHandler.load() || new GuildHandler();

/**
 * send the entries in an embed
 * @param channel the channel to send the embed to
 * @param entries the entries to send
 */
export async function sendEntryEmbeds(
    channel: TextChannel | NewsChannel,
    entries: Entry[],
) {
    const dates: Date[] = [];

    // add the dates of the entries to the dates array
    for (const entry of entries) {
        if (!dates.some((d) => d.toString() === entry.date.toString())) {
            dates.push(entry.date);
        }
    }

    // create a new embed for the update
    const embed = new MessageEmbed()
        .setColor("YELLOW")
        .setTitle("Neue Änderungen")
        .setTimestamp(new Date());

    // iterate over each date
    for (const date of dates) {
        let text = "";
        const entriesToday = entries.filter(
            (entry) => entry.date.toString() === date.toString(),
        );
        let dayName = entriesToday[0].day;

        // add the entries of the date to the text
        for (const entry of entriesToday) {
            switch (entry.type.toLowerCase()) {
                case "vertretung":
                    text += `**${entry.period}.** Stunde vertretung ${entry.newSubject}\n`;
                    break;
                case "entfall":
                    text += `**${entry.period}.** Stunde ${entry.oldSubject} entfällt\n`;
                    break;
                case "verlegung":
                    text += `**${entry.period}. ** Stunde`;
                    if (entry.oldSubject === entry.newSubject) {
                        text += ` gleiches Fach`;
                    } else {
                        text += ` statt ${entry.oldSubject} habt ihr ${entry.newSubject}`;
                    }
                    if (entry.oldRoom === entry.newRoom) {
                        text += ` selber Raum\n`;
                    } else {
                        text += `in Raum ${entry.newRoom} statt ${entry.oldRoom}\n`;
                    }
                    break;
                case "tausch":
                    if (entry.oldRoom === entry.newRoom) {
                        text += `**${entry.period}.** Stunde altes Fach ${entry.oldSubject} wird durch ${entry.newSubject} ersetzt gleicher Raum\n`;
                    } else {
                        text += `**${entry.period}.** Stunde altes Fach ${entry.oldSubject} wird durch ${entry.newSubject} in Raum ${entry.newRoom} statt ${entry.oldRoom}\n`;
                    }
                    break;
                case "raum-vtr.":
                    text += `**${entry.period}.** Stunde statt ${entry.oldRoom} in ${entry.newRoom}\n`;
                    break;
                case "betreuung":
                    text += `**${entry.period}.** Stunde ${entry.newSubject} wird nur betreut\n`;
                    break;
                default:
                    text += `**${entry.period}. ** Stunde`;
                    if (entry.oldSubject === entry.newSubject) {
                        text += ` gleiches Fach`;
                    } else {
                        text += ` statt ${entry.oldSubject} habt ihr ${entry.newSubject}`;
                    }
                    if (entry.oldRoom === entry.newRoom) {
                        text += ` selber Raum\n`;
                    } else {
                        text += `in Raum ${entry.newRoom} statt ${entry.oldRoom}\n`;
                    }
            }
        }

        // get the localized day and month
        const [dayNum, month] = date
            .toLocaleDateString("de-DE", {
                month: "long",
                day: "2-digit",
            })
            .split(".");
        embed.addField(`${dayName}, ${dayNum}. ${month}`, text, true);
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
        const channel = interaction.channel;
        const guildId: string = interaction.guildId!;

        // check whether the channel is a text channel
        if (!channel!.isText() || channel.isThread()) {
            await interaction.reply(
                ":x: Dieser Kanal ist kein gewöhnlicher Text-Kanal",
            );
            return;
        }
        // check whether the channel is already bound
        else if (
            guildHandler.getOptions(guildId)?.botChannelId ===
            interaction.channelId
        ) {
            await interaction.reply(":x: Dieser Kanal ist bereits gesetzt");
            return;
        }

        // get the guild options
        // in this case, the guild options CAN NOT be null
        const options: GuildOptions = guildHandler.getOptions(guildId)!;
        options.botChannelId = interaction.channelId;

        // set the schedule handler if it is not already set
        options.scheduleHandler ??= new ScheduleHandler(
            process.env.DSB_USERNAME!,
            process.env.DSB_PASSWORD!,
            process.env.CLASS_NAME!,
        );

        options.scheduleHandler.onUpdate(async (entries) => {
            // typescript needs to ignore the following instruction because
            // the channels type is somehow not recognized
            // @ts-ignore
            await sendEntryEmbeds(channel, entries);
        });

        // set the guild options
        guildHandler.setOptions(interaction.guildId!, options);

        // reply to the user with success
        await interaction.reply(
            `:white_check_mark: <#${interaction.channelId}> wurde als Hauptkanal gesetzt`,
        );

        // update the schedule handler
        await options.scheduleHandler.update();
    },
);

cmds.registerCommand(
    "bound",
    "zeigt den aktuellen Hauptkanal an",
    async (_client, interaction) => {
        const guildId: string = interaction.guildId!;

        // get the guild options
        const options = guildHandler.getOptions(guildId)!;

        // check whether the channel is bound
        if (options.botChannelId !== undefined) {
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
        const guildId = interaction.guildId!;

        // check whether the channel was bound
        if (!guildHandler.guildOptionsMap.has(guildId)) {
            await interaction.reply(
                `:x: Es wurde kein Kanal gesetzt. Rufe \`${PREFIX}help\` auf für Hilfe`,
            );
            return;
        }

        // remove the channel from the guild options
        guildHandler.removeGuild(guildId);
        await interaction.reply(
            ":white_check_mark: Der Hauptkanal wurde entfernt",
        );
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
                // list the contributors and link their GitHub profiles
                Array.from(CONTRIBUTORS.entries())
                    .map(([name, link]) => `**${name}**: ${link}`)
                    .join("\n"),
            )
            .addField(
                "Quellcode auf GitHub",
                "https://github.com/Kaffeegeist/rector-bot",
            );

        await interaction.reply({ embeds: [embed] });
    },
);

export { cmds as commandHandler, guildHandler };
