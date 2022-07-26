import { Entry } from "dsbmobile";
import { existsSync, readFileSync } from "node:fs";
import defaultConfig from "./default-config.json";
import { formatFromMap } from "./utility";

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

    /**
     * get the response to a certain entry type
     * @param entry the entry to compute the response from
     * @returns the computed response
     */
    getResponse(entry: Entry): string {
        const rawResponse = this.responseMap.get(
            this.responseMap.has(entry.type) ? entry.type : "default",
        )!;
        return this.formatResponse(rawResponse, entry);
    }

    formatResponse(response: string, entry: Entry): string {
        const replacementMap = new Map<string, string>([
            ["OLD_SUBJECT", entry.oldSubject],
            ["NEW_SUBJECT", entry.newSubject],
            ["PERIOD", entry.period.toString()],
            ["OLD_ROOM", entry.oldRoom],
            ["NEW_ROOM", entry.newRoom],
        ]);
        return formatFromMap(response, replacementMap);
    }
}
