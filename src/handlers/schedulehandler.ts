import Dsbmobile, { Entry } from "dsbmobile";
import { isDateInPast } from "../utility";

type updateCallbackType = (entries: Entry[]) => void | Promise<void>;

function entryEquals(e1: Entry, e2: Entry) {
    return (
        e1.description === e2.description &&
        e1.day === e2.day &&
        e1.period === e2.period
    );
}

export class ScheduleHandler {
    private readonly dsb: Dsbmobile;
    previousEntries: Entry[] = [];
    updateCallbacks: updateCallbackType[] = [];
    className: string;
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
        this.intervalId = setInterval(() => this.update(), 5 * 60 * 1000);
    }

    cleanPreviousEntries() {
        // Subtract a week from unix time
        const now = Date.now() - 7 * 24 * 60 * 60 * 1000;
        this.previousEntries = this.previousEntries.filter(
            (entry) => !isDateInPast(entry.date, new Date(now)),
        );
    }

    async update() {
        this.cleanPreviousEntries();
        const timeTable = await this.dsb.getTimetable();
        const entries: Entry[] = timeTable.findByClassName(this.className);
        const newEntries = entries.filter((newEntry) => {
            return !this.previousEntries.some((prevEntry) =>
                entryEquals(newEntry, prevEntry),
            );
        });

        if (newEntries.length === 0) return;

        this.previousEntries = this.previousEntries.concat([...newEntries]);
        this.updateCallbacks.forEach((f) => f([...newEntries]));
    }

    onUpdate(callback: updateCallbackType) {
        console.log("HERE");
        this.updateCallbacks.push(callback);
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

    static fromJSON(json: object) {
        const dsb = Dsbmobile.fromJSON(json["dsb"]);
        const scheduleHandler = new ScheduleHandler(dsb, json["class-name"]);
        scheduleHandler.previousEntries = json["previous-entries"].map(
            (entry: object) => Entry.fromJSON(entry),
        );
        return scheduleHandler;
    }
}
