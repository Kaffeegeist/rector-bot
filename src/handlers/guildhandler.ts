import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { ScheduleHandler } from "./schedulehandler";

export interface GuildOptions {
    botChannelId?: string;
    scheduleHandler?: ScheduleHandler;
}

export class GuildHandler {
    static dataDirPath = "./data";
    static filePath = `${this.dataDirPath}/guild-options.json`;
    guildOptionsMap: Map<string, GuildOptions> = new Map();

    addGuild(guildId: string, config: GuildOptions = {}): void {
        config.scheduleHandler.onUpdate(() => this.save());
        this.setOptions(guildId, config);
    }

    removeGuild(guildId: string): void {
        this.getOptions(guildId, false)?.scheduleHandler.destroy();
        this.guildOptionsMap.delete(guildId);
        this.save();
    }

    setOptions(guildId: string, options: GuildOptions) {
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
        if (!existsSync(GuildHandler.dataDirPath))
            mkdirSync(GuildHandler.dataDirPath);

        writeFileSync(GuildHandler.filePath, JSON.stringify(this.toJSON()));
    }

    static load() {
        console.log(`${this.filePath} exists? ${existsSync(this.filePath)}`);
        return !existsSync(this.filePath)
            ? null
            : this.fromJSON(JSON.parse(readFileSync(this.filePath).toString()));
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
                ),
                botChannelId: options["bot-channel-id"],
            } as GuildOptions,
        ]);
        guildHandler.guildOptionsMap = new Map(json);
        guildHandler.guildOptionsMap.forEach((options, _guildId) => {
            options.scheduleHandler.onUpdate(() => guildHandler.save());
        });
        return guildHandler;
    }
}
