import Dsbmobile, { Entry } from "dsbmobile";
import { isDateInPast } from "../utility";
import { GuildHandler } from "./guildhandler";

type updateCallbackType = (entries: Entry[]) => void | Promise<void>;

function secureCompareEntry(e1: Entry, e2: Entry) {
    return JSON.stringify(e1.toJSON()) === JSON.stringify(e2.toJSON());
}

export class ScheduleHandler {
    private readonly dsb: Dsbmobile;
    previousEntries: Entry[] = [];
    updateCallback: updateCallbackType;
    className: string;
    parent: GuildHandler;
    private intervalId: NodeJS.Timer;

    constructor(dsbUsername: string, dsbPassword: string, className: string);
    constructor(dsb: Dsbmobile, className: string);

    constructor(...args: any[]) {
        if (args[0] instanceof Object) {
            this.dsb = args[0];
            this.className = args[1];
        } else {
            this.dsb = new Dsbmobile({
                id: args[0],
                password: args[1],
                baseURL: "https://mydsb.johannespour.de",
                resourceBaseURL: "https://mydsb.johannespour.de/light",
            });
            this.className = args[2];
        }

        // update every 15 minutes
        this.intervalId = setInterval(
            async () => await this.update(),
            5 * 60 * 1000,
        );

        // run initially
        this.update();
    }

    cleanPreviousEntries() {
        const now = new Date();
        this.previousEntries = this.previousEntries.filter(
            (entry) => !isDateInPast(entry.date, now),
        );
    }

    async update() {
        console.log(this.previousEntries);
        this.cleanPreviousEntries();
        const timeTable = await this.dsb.getTimetable();
        const entries = timeTable.findByClassName(this.className);
        const newEntries = entries.filter(
            (newEntry) =>
                !this.previousEntries.some((prevEntry) =>
                    secureCompareEntry(newEntry, prevEntry),
                ),
        );

        this.updateCallback([...newEntries]);
        this.previousEntries = this.previousEntries.concat([...newEntries]);
        this.parent.save();
    }

    onUpdate(callback: updateCallbackType) {
        this.updateCallback = callback;
    }

    destroy() {
        clearInterval(this.intervalId);
    }

    toJSON() {
        return {
            dsb: this.dsb.toJSON(),
            "previous-entries": this.previousEntries.map((entry) =>
                entry.toJSON(),
            ),
            "class-name": this.className,
        };
    }

    static fromJSON(json: object, parent?: GuildHandler) {
        const dsb = Dsbmobile.fromJSON(json["dsb"]);
        const scheduleHandler = new ScheduleHandler(dsb, json["class-name"]);
        json["previous-entries"] = json["previous-entries"].map(
            (entry: object) => {
                entry["date"] = new Date(entry["date"]);
                return entry;
            },
        );
        scheduleHandler.previousEntries = json["previous-entries"].map(
            (entry: object) => Entry.fromJSON(entry),
        );
        scheduleHandler.parent = parent;
        return scheduleHandler;
    }
}
