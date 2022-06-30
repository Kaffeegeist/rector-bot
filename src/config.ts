import { existsSync, readFileSync } from "node:fs";
import defaultConfig from "./default-config.json";

export type ResponseMap = Map<string, string>;

interface ConfigFile {
    responses: {
        [key: string]: string;
    };
}

export class Config {
    private static _instance: Config;

    responseMap: ResponseMap;

    constructor(configPath = "./data/config.json") {
        Config._instance = this;
        let jsonContent: ConfigFile;

        if (!existsSync(configPath)) {
            console.log("Config file does not exist, importing default config");
            jsonContent = defaultConfig as ConfigFile;
        } else {
            const content = readFileSync(configPath);
            jsonContent = JSON.parse(content.toString("utf-8")) as ConfigFile;
        }

        this.responseMap = new Map(Object.entries(jsonContent.responses));
        for (const [entryType, response] of Object.entries<string>(
            jsonContent.responses,
        )) {
            this.responseMap.set(entryType, response);
        }
    }

    static get instance() {
        return this._instance || new Config();
    }
}
