import { Message, MessageEmbed } from "discord.js";
import { Entry } from "dsbmobile";

export function isDateInPast(firstDate: Date, secondDate: Date): boolean {
    if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0))
        return true;

    return false;
}

export async function sendEntryEmbeds(message: Message, entries: Entry[]) {
    const embed = new MessageEmbed().setColor("YELLOW").setTitle("Vertretung");
    for (const entry of entries) {
        embed.addField(entry.type, entry.longOldSubject);
    }
    await message.channel.send({ embeds: [embed] });
}
