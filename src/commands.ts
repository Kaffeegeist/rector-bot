import CommandHandler from "./commandhandler";

const cmds = new CommandHandler();

cmds.registerCommand("help", async (_client, message) => {
    await message.reply("Hilfe");
});

export default cmds;
