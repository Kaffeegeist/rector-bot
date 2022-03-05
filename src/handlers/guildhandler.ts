import { writeFileSync, readFileSync } from "node:fs";
import { ScheduleHandler } from "./schedulehandler";

export interface GuildOptions {
    botChannelId?: string;
    scheduleHandler?: ScheduleHandler;
}

export class GuildHandler {
    guildOptionsMap: Map<string, GuildOptions> = new Map();

    addGuild(guildId: string, config: GuildOptions = {}): void {
        this.guildOptionsMap.set(guildId, config);
        this.write();
    }

    removeGuild(guildId: string): void {
        this.guildOptionsMap.delete(guildId);
        this.write();
    }

    setOptions(guildId: string, options: GuildOptions) {
        this.guildOptionsMap.set(guildId, options);
        this.write();
    }

    getOptions(guildId: string): GuildOptions {
        if (!this.guildOptionsMap.has(guildId)) this.addGuild(guildId);
        return { ...this.guildOptionsMap.get(guildId) };
    }

    write() {
        writeFileSync(
            "./data/guild-options.json",
            JSON.stringify(this.toJSON()),
        );
    }

    static read() {
        return this.fromJSON(
            JSON.parse(readFileSync("./data/guild-options.json").toString()),
        );
    }

    toJSON() {
        const serializedMap = [];
        this.guildOptionsMap.forEach((options, guildId) => {
            serializedMap.push([guildId, options]);
        });
        return serializedMap;
    }

    static fromJSON(json: any) {
        const guildHandler = new GuildHandler();
        guildHandler.guildOptionsMap = new Map(json);
        return guildHandler;
    }
}
