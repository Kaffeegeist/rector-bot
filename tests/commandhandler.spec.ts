import { expect } from "chai";
import { CommandHandler } from "../src/handlers/commandhandler";

const commandHandler = new CommandHandler();

describe("Test CommandHandler", () => {
    it("add Command", () => {
        commandHandler.registerCommand(
            "hello",
            "greets the user",
            async (_client, message) => {
                await message.reply("Hello");
            },
        );
        expect(commandHandler.commands.has("hello")).to.be.true;
        const command = commandHandler.commands.get("hello")!;
        expect(command.name).to.equal("hello");
        expect(command.description).to.equal("greets the user");
        expect(command.callback).to.be.a("function");
    });

    xit("handle command", () => {
        // TODO: mock discord request
    });
});
