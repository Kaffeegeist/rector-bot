import { Guild } from "discord.js";

export interface GuildOptions {
    botChannelId?: string;
}

export class GuildHandler {
    guildOptionsMap: Map<string, GuildOptions> = new Map();

    addGuild(guildId: string, config: GuildOptions = {}): void {
        this.guildOptionsMap.set(guildId, config);
    }

    removeGuild(guildId: string): void {
        this.guildOptionsMap.delete(guildId);
    }

    getOptions(guild: Guild): GuildOptions {
        if (!this.guildOptionsMap.has(guild.id)) this.addGuild(guild.id);
        return this.guildOptionsMap.get(guild.id);
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
