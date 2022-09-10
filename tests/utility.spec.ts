import { Command, CommandHandler } from "../src/handlers/commandhandler";
import { isDateInPast, serializeCommands } from "../src/utility";
import { expect } from "chai";

describe("Test Utility", () => {
    it("isDateInPast", () => {
        const future = new Date(2020, 1, 1);
        const past = new Date(2019, 1, 1);
        expect(isDateInPast(future, past)).to.be.true;
        expect(isDateInPast(past, future)).to.be.false;
    });

    it("serializeCommands", () => {
        const commands = [
            {
                name: "first command",
                description: "this is the first sample command",
                callback: () => {},
            } as Command,
            {
                name: "second command",
                description: "this is the second sample command",
                callback: () => {},
            } as Command,
            {
                name: "third command",
                description: "this is the third sample command",
                callback: () => {},
            } as Command,
        ];
        const commandHandler = new CommandHandler();
        commands.forEach((cmd) =>
            commandHandler.registerCommand(
                cmd.name,
                cmd.description,
                cmd.callback,
            ),
        );

        serializeCommands(commandHandler).forEach((cmd, i) => {
            expect(cmd.name).to.equal(commands[i].name);
            expect(cmd.description).to.equal(commands[i].description);
        });
    });
});
