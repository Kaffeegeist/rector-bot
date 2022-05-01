import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { ScheduleHandler } from "./schedulehandler";

/**
 * the options for a guild
 */
export interface GuildOptions {
    botChannelId?: string;
    scheduleHandler?: ScheduleHandler;
}

export class GuildHandler {
    static dataDirPath = "./data";
    static filePath = `${this.dataDirPath}/guild-options.json`;

    /** the collection of guild options */
    guildOptionsMap: Map<string, GuildOptions> = new Map();

    /**
     * add a guild with its configuration
     * @param guildId the id of the guild
     * @param config the configuration of the guild
     */
    addGuild(guildId: string, config: GuildOptions = {}): void {
        config.scheduleHandler?.onUpdate(() => this.save());
        this.setOptions(guildId, config);
    }

    /**
     * remove a guild from the handler
     * @param guildId the id of the guild
     */
    removeGuild(guildId: string): void {
        if (!this.guildOptionsMap.has(guildId)) return;
        this.getOptions(guildId, false)?.scheduleHandler.destroy();
        this.guildOptionsMap.delete(guildId);
        this.save();
    }

    /**
     * set the options for a guild
     * @param guildId the id of the guild
     * @param options the options to set
     */
    setOptions(guildId: string, options: GuildOptions) {
        const oldOptions = this.getOptions(guildId, false);
        if (
            oldOptions !== null &&
            oldOptions.scheduleHandler !== undefined &&
            options.scheduleHandler !== undefined
        ) {
            options.scheduleHandler.onUpdate(() => this.save());
        }

        this.guildOptionsMap.set(guildId, options);
        this.save();
    }

    /**
     * get the options for a guild
     * @param guildId the id of the guild
     * @param autoCreate whether to create the options if they don't exist
     * @returns the options for the guild
     */
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

    /**
     * writes the guild options to the file
     */
    save() {
        if (!existsSync(GuildHandler.dataDirPath))
            mkdirSync(GuildHandler.dataDirPath);

        writeFileSync(GuildHandler.filePath, JSON.stringify(this.toJSON()));
    }

    /**
     * loads the guild options from the file
     * @returns the guild handler or null if the file doesn't exist
     */
    static load() {
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
