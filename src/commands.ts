import { MessageEmbed } from "discord.js";
import CommandHandler from "./commandhandler";

const cmds = new CommandHandler();

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

// make this CommandHandler instance accessible outside of this file,
// while the object keeps containing its registered commands
export default cmds;
