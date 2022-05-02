import { CommandHandler } from "./handlers/commandhandler";

/**
 * checks whether the date is after `past`
 * @param past the first date
 * @param date the second date
 * @returns whether the first date is before the second date
 */
export function isDateInPast(past: Date, date: Date): boolean {
    if (past.setHours(0, 0, 0, 0) < date.setHours(0, 0, 0, 0)) return true;

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
