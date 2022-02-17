import type { Client, Message } from "discord.js";

export default class CommandHandler {
    commands: Map<
        string,
        (client: Client, message: Message) => void | Promise<void>
    > = new Map();

    registerCommand(
        commandName: string,
        callback: (client: Client, message: Message) => void | Promise<void>,
    ) {
        this.commands.set(commandName, callback);
    }

    async handleCommand(client: Client, message: Message, prefix: string) {
        const regex = new RegExp(`^${prefix}`, "i");
        const command = message.content.replace(regex, "");

        if (this.commands.has(command)) {
            await this.commands.get(command)(client, message);
        } else {
            this.commands.get("help")(client, message);
        }
    }
}
