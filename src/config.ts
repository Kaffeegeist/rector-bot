import { Entry } from "dsbmobile";
import { existsSync, readFileSync } from "node:fs";
import defaultConfig from "./default-config.json";
import { formatFromMap } from "./utility";

export type ResponseMap = Map<string, string>;

/**
 * the layout of a raw json config file
 */
interface ConfigFile {
    responses: {
        [key: string]: string;
    };
}

/**
 * the configuration for the bot instance
 *
 * this is a singleton class, so to get an instance of this class, use `Config.instance`
 */
export class Config {
    private static _instance: Config;

    /**
     * the map used for resoponding to different entry types
     */
    responseMap: ResponseMap;

    constructor(configPath = "./data/config.json") {
        // Only allow one single instance of this class
        Config._instance = this;
        let jsonContent: ConfigFile;

        if (!existsSync(configPath)) {
            console.log("Config file does not exist, importing default config");
            // load default configuration
            jsonContent = defaultConfig as ConfigFile;
        } else {
            // read the config file
            const content = readFileSync(configPath);
            // parse the config file
            jsonContent = JSON.parse(content.toString("utf-8")) as ConfigFile;
        }

        // create the response map from the config file
        this.responseMap = new Map(Object.entries(jsonContent.responses));
    }

    /**
     * get the instance of the config class
     */
    static get instance(): Config {
        // return either the existing instance or create a new one
        return this._instance || new Config();
    }

    /**
     * get the response to a certain entry type
     * @param entry the entry to compute the response from
     * @returns the computed response
     */
    getResponse(entry: Entry): string {
        const entryType = entry.type.toLowerCase();
        const rawResponse = this.responseMap.get(
            this.responseMap.has(entryType) ? entryType : "default",
        )!;
        return this.formatResponse(rawResponse, entry);
    }

    /**
     * formats the response with the entry data
     * @param response the response to format
     * @param entry the entry to format the response with
     * @returns the formatted response
     */
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
