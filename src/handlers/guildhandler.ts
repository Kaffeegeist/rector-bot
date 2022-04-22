import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { ScheduleHandler } from "./schedulehandler";

export interface GuildOptions {
    botChannelId?: string;
    scheduleHandler?: ScheduleHandler;
}

export class GuildHandler {
    static filePath: string = "./data/guild-options.json";
    guildOptionsMap: Map<string, GuildOptions> = new Map();

    addGuild(guildId: string, config: GuildOptions = {}): void {
        this.guildOptionsMap.set(guildId, config);
        this.save();
    }

    removeGuild(guildId: string): void {
        this.getOptions(guildId, false)?.scheduleHandler.destroy();
        this.guildOptionsMap.delete(guildId);
        this.save();
    }

    setOptions(guildId: string, options: GuildOptions) {
        if (options.scheduleHandler !== undefined)
            options.scheduleHandler.parent = this;
        this.guildOptionsMap.set(guildId, options);
        this.save();
    }

    getOptions(guildId: string, autoCreate = true): GuildOptions | null {
        if (!this.guildOptionsMap.has(guildId)) {
            if (autoCreate) {
                this.guildOptionsMap.set(guildId, {} as GuildOptions);
            } else {
                return null;
            }
        }
        return { ...this.guildOptionsMap.get(guildId) };
    }

    save() {
        writeFileSync(GuildHandler.filePath, JSON.stringify(this.toJSON()));
    }

    static load() {
        return !existsSync(GuildHandler.filePath)
            ? null
            : this.fromJSON(
                  JSON.parse(
                      readFileSync("./data/guild-options.json").toString(),
                  ),
              );
    }

    toJSON() {
        const serializedMap = [];
        this.guildOptionsMap.forEach((options, guildId) => {
            serializedMap.push([
                guildId,
                {
                    "bot-channel-id": options.botChannelId,
                    scheduleHandler: options.scheduleHandler.toJSON(),
                },
            ]);
        });
        return serializedMap;
    }

    static fromJSON(json: any) {
        const guildHandler = new GuildHandler();
        json = json.map(([guildId, options]) => [
            guildId,
            {
                scheduleHandler: ScheduleHandler.fromJSON(
                    options.scheduleHandler,
                    guildHandler,
                ),
                botChannelId: options["bot-channel-id"],
            } as GuildOptions,
        ]);
        guildHandler.guildOptionsMap = new Map(json);
        console.log(json);
        return guildHandler;
    }
}