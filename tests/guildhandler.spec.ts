import { expect } from "chai";
import { GuildHandler } from "@/handlers/guildhandler";

const guildHandler = new GuildHandler(false);

describe("Test GuildHandler", () => {
    it("add Guild", () => {
        guildHandler.addGuild("123");
        expect(guildHandler.guildOptionsMap.has("123")).to.be.true;
    });

    it("edit Guild settings", () => {
        expect(guildHandler.getOptions("123")?.botChannelId).to.equal(
            undefined,
        );
        guildHandler.setOptions("123", {
            botChannelId: "456",
        });
        expect(guildHandler.getOptions("123")?.botChannelId).to.equal("456");
    });

    it("get Guild Options", () => {
        const opt = guildHandler.getOptions("123");
        expect(opt.botChannelId).to.equal("456");
        opt.botChannelId = "789";
        expect(guildHandler.getOptions("123")?.botChannelId).to.equal("456");
    });

    it("remove Guild", () => {
        guildHandler.removeGuild("123");
        expect(guildHandler.guildOptionsMap.has("123")).to.be.false;
    });
});
