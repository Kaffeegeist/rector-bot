import type { Client, Message } from "discord.js";

export interface Command {
    name: string;
    description: string;
    callback: (client: Client, message: Message) => void | Promise<void>;
}

export default class CommandHandler {
    commands: Map<string, Command> = new Map();

    registerCommand(
        commandName: string,
        description: string,
        callback: (client: Client, message: Message) => void | Promise<void>,
    ) {
        this.commands.set(commandName, {
            name: commandName,
            description,
            callback,
        });
    }

    async handleCommand(client: Client, message: Message, prefix: string) {
        const regex = new RegExp(`^${prefix}`, "i");
        const command = message.content.replace(regex, "");

        if (this.commands.has(command)) {
            await this.commands.get(command).callback(client, message);
        } else {
            this.commands.get("help").callback(client, message);
        }
    }
}
