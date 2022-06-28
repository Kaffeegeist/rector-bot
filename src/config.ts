import { existsSync, readFileSync } from "node:fs";

export type ResponseMap = Map<string, string>;

export class Config {
    private static _instance: Config;

    responseMap: ResponseMap | null = null;

    constructor(configPath = "./data/config.json") {
        Config._instance = this;
        if (!existsSync(configPath)) {
            console.log("Config does not exist");
            return;
        }

        const content = readFileSync(configPath);
        const jsonContent = JSON.parse(content.toString("utf-8"));
        if ("reponses" in jsonContent) {
            this.responseMap = new Map();
            for (const [entryType, response] of Object.entries<string>(
                jsonContent["responses"],
            )) {
                this.responseMap.set(entryType, response);
            }
        }
    }

    static get instance() {
        return this._instance || new Config();
    }
}
