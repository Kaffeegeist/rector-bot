import { CommandHandler } from "./handlers/commandhandler";

/**
 * checks whether the first date is before the second date
 * @param firstDate the first date
 * @param secondDate the second date
 * @returns whether the first date is before the second date
 */
export function isDateInPast(firstDate: Date, secondDate: Date): boolean {
    if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0))
        return true;

    return false;
}

/**
 * serialize the commands to a slash command friendly object
 * @param commandHandler the command handler to serialize the commands from
 * @returns the serialized commands
 */
export function serializeCommands(commandHandler: CommandHandler) {
    // serialize the commands to be able to present them as slash commands
    return Array.from(commandHandler.commands).map(([_, cmd]) => {
        return {
            name: cmd.name,
            description: cmd.description,
        };
    });
}
