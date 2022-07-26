import { CommandHandler } from "./handlers/commandhandler";

/**
 * checks whether the date is after `past`
 * @param past the first date (the past)
 * @param date the second date (the given moment)
 * @returns whether the first date is before the second date
 */
export function isDateInPast(past: Date, date: Date): boolean {
    return past.setHours(0, 0, 0, 0) < date.setHours(0, 0, 0, 0);
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

/**
 * format a string from a map
 * @param str the string to format
 * @param map the map containing the replacement keys and values
 * @returns the formatted map
 *
 * @example
 * ```ts
 * const text = "Hello, OBJECT!"
 * const map = new Map([["OBJECT", "World"]])
 * formatFromMap(text, map)
 * // => "Hello, World!"
 * ```
 */
export function formatFromMap(str: string, map: Map<string, string>): string {
    for (const [key, value] of map.values()) {
        str = str.replace(key, value);
    }
    return str;
}
