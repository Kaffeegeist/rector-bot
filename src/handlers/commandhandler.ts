import type { Client, CommandInteraction } from "discord.js";

/** a new type for a CommandCallback, to prevent redundant typing */
type CommandCallback = (
    /** the client object that is passed by the handler */
    client: Client,
    /** the message object that is passed by the handler */
    interaction: CommandInteraction,
    /** returns nothing and is optionally asynchronus */
) => void | Promise<void>;

/** the "layout" of a Command object */
export interface Command {
    /** the name of the command/how it should be called */
    name: string;
    /** the description of the command that will get displayed in the `/help` command */
    description: string;
    /** the callback of the command, that is executed when the command is called */
    callback: CommandCallback;
}

/**
 * registers and handels commands
 */
export class CommandHandler {
    /**
     * the collection of commands
     */
    commands: Map<string, Command> = new Map();

    /**
     * registers a new command
     * @param commandName the name of the command/how it should be called
     * @param description a short but declarative explanation of what the command does
     * @param callback the function that should be called, when someone types the command
     *
     * @example
     * ```ts
     * const commandHandler = new CommandHandler();
     * commandHandler.registerCommand(
     *   "hello",
     *   "greets the user",
     *   async (client, message) => {
     *     await message.reply("Hello, " + message.author.username + "!");
     * });
     * ```
     * Result:
     * ```no-highlight
     * [User]: /hello
     * [Bot]: Hello, User!
     * ```
     */
    registerCommand(
        commandName: string,
        description: string,
        callback: CommandCallback,
    ) {
        /** set a new command with the name `commandName`,
         *  the description `description` and
         *  the callback `callback`
         */
        this.commands.set(commandName, {
            name: commandName,
            description,
            callback,
        });
    }

    /**
     * handle a command using the registered commands
     * @param client the client that is handeling the command
     * @param message the message object that was sent
     * @param prefix the prefix of the bot
     *
     * @example
     * ```ts
     * // ... Client already declared above as client
     * // ... CommandHandler already declared above as commandHandler
     * client.on("message", async (message) => {
     *   await commandHandler.handleCommand(client, message, "!");
     * });
     * ```
     */
    async handleCommand(client: Client, interaction: CommandInteraction) {
        if (!interaction.isCommand()) return;
        const commandName = interaction.commandName;

        // check whether a callback for this command has already been declared
        if (this.commands.has(commandName)) {
            // get the callback from commands and call it
            await this.commands.get(commandName)!.callback(client, interaction);
        } else {
            // respond with help if command can't be recognized
            this.commands.get("help")!.callback(client, interaction);
        }
    }
}
