import { MessageEmbed, NewsChannel, TextChannel } from "discord.js";
import { Entry } from "dsbmobile";

export function isDateInPast(firstDate: Date, secondDate: Date): boolean {
    if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0))
        return true;

    return false;
}

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
        .setTitle("Neue Änderungen");

    for (const date of dates) {
        let text = "";
        let day = "";
        for (const entry of entries.filter(
            (entry) => entry.date.toString() === date.toString(),
        )) {
            text += `${entry.period}. Stunde - ${entry.type}\n`;
            day = entry.day;
        }
        embed.addField(`${date.toLocaleDateString()}, ${day}`, text);
    }

    await channel.send({ embeds: [embed] });
}
