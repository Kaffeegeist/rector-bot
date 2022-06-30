import { Entry } from "dsbmobile";
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
    }

    static get instance() {
        return this._instance || new Config();
    }

    getResponse(entry: Entry): string {
        return this.formatResponse(
            this.responseMap.get(
                this.responseMap.has(entry.type) ? entry.type : "default",
            )!,
            entry,
        );
    }

    formatResponse(response: string, entry: Entry): string {
        const replacementMap = new Map<string, string>([
            ["OLD_SUBJECT", entry.oldSubject],
            ["NEW_SUBJECT", entry.newSubject],
            ["PERIOD", entry.period.toString()],
            ["OLD_ROOM", entry.oldRoom],
            ["NEW_ROOM", entry.newRoom],
        ]);
        for (const [k, v] of replacementMap.entries()) {
            response.replace(k, v);
        }
        return response;
    }
}
