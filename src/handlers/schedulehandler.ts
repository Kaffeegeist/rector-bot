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
    /** the dsb instance used to fetch the timetable */
    private dsb: Dsbmobile;

    /** the entries that already were listed and should not be listed again */
    previousEntries: Entry[] = [];

    /** the update callbacks that should be called when the schedule changes */
    updateCallbacks: updateCallbackType[] = [];

    /** the name of the class */
    className: string;

    /** the id of the interval that checks the schedule for updates */
    private intervalId: NodeJS.Timer;

    // constructor #1
    constructor(dsbUsername: string, dsbPassword: string, className: string);
    // constructor #2
    constructor(dsb: Dsbmobile, className: string);

    constructor(...args: any[]) {
        // constructor #1
        if (args[0] instanceof Object) {
            this.dsb = args[0];
            this.className = args[1];
        }
        // constructor #2
        else {
            this.dsb = new Dsbmobile({
                id: args[0],
                password: args[1],
                baseURL: "https://mydsb.johannespour.de",
                resourceBaseURL: "https://mydsb.johannespour.de/light",
            });
            this.className = args[2];
        }

        // check the schedule for updates every 5 minutes
        this.intervalId = setInterval(() => this.update(), 5 * 60 * 1000);
    }

    /**
     * removes all entries that are in the past
     */
    cleanPreviousEntries() {
        // subtract a week from unix time
        const now = Date.now() - 7 * 24 * 60 * 60 * 1000;

        // remove entries that are in the past
        this.previousEntries = this.previousEntries.filter(
            (entry) => !isDateInPast(entry.date, new Date(now)),
        );
    }

    /**
     * checks the schedule for updates and calls the update callbacks if there are changes
     */
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

    /**
     * adds the given callback to the update callbacks
     * @param callback the callback that should be called when the schedule changes
     */
    onUpdate(callback: updateCallbackType) {
        this.updateCallbacks.push(callback);
    }

    /**
     * securely destroys the schedule handler
     */
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
