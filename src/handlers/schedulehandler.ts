import Dsbmobile, { Entry, TimeTable } from "dsbmobile";
import { isDateInPast } from "../utility";
require("dotenv").config();

type updateCallbackType = (entries: Entry[]) => void | Promise<void>;

function entryEquals(e1: Entry, e2: Entry) {
    return (
        e1.description === e2.description &&
        e1.day === e2.day &&
        e1.period === e2.period
    );
}

export interface ScheduleHandlerJSON {
    dsb: object;
    "previous-entries": object[];
    "class-name": string;
}

export class ScheduleHandler {
    private static _instance: ScheduleHandler;

    /** the dsb instance used to fetch the timetable */
    private dsb: Dsbmobile;

    /** the id of the interval that checks the schedule for updates */
    private intervalId: NodeJS.Timer;

    /** the entries that already were listed and should not be listed again */
    previousEntries: Entry[] = [];

    /** the update callbacks that should be called when the schedule changes */
    updateCallbacks: updateCallbackType[] = [];

    /** the name of the class */
    className: string;

    // constructor #1
    constructor(dsbUsername: string, dsbPassword: string, className: string) {
        ScheduleHandler._instance = this;

        this.dsb = new Dsbmobile({
            id: dsbUsername,
            password: dsbPassword,
            baseURL: "https://mydsb.johannespour.de",
            resourceBaseURL: "https://mydsb.johannespour.de/light",
        });

        this.className = className;

        // check the schedule for updates every 5 minutes
        this.intervalId = setInterval(() => this.update(), 5 * 60 * 1000);
    }

    static get instance() {
        return (
            ScheduleHandler._instance ??
            new ScheduleHandler(
                process.env.DSB_USERNAME!,
                process.env.DSB_PASSWORD!,
                process.env.CLASS_NAME!,
            )
        );
    }

    /**
     * removes all entries that are in the past
     */
    cleanPreviousEntries() {
        this.previousEntries = this.previousEntries.filter(
            (entry) => !isDateInPast(entry.date),
        );
    }

    /**
     * checks the schedule for updates and calls the update callbacks if there are changes
     */
    async update() {
        this.cleanPreviousEntries();
        let timeTable: TimeTable;
        try {
            timeTable = await this.dsb.getTimetable();
        } catch (e) {
            console.log(this.dsb);
            throw e;
        }
        const entries: Entry[] = timeTable.findByClassName(this.className);
        const newEntries = entries.filter((newEntry) => {
            return (
                !this.previousEntries.some((prevEntry) =>
                    entryEquals(newEntry, prevEntry),
                ) && !isDateInPast(newEntry.date)
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

    toJSON(): ScheduleHandlerJSON {
        return {
            dsb: this.dsb.toJSON(),
            "previous-entries": this.previousEntries.map((entry) =>
                entry.toJSON(),
            ),
            "class-name": this.className,
        };
    }

    static fromJSON(json: ScheduleHandlerJSON) {
        const scheduleHandler = ScheduleHandler.instance;
        scheduleHandler.previousEntries = json["previous-entries"].map(
            (entry: object) => Entry.fromJSON(entry),
        );
        return scheduleHandler;
    }
}
