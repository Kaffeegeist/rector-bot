import { Client, Intents } from "discord.js";
import Dsbmobile, { Entry, TimeTable } from "dsbmobile";
import { getSyntheticLeadingComments, OutputFileType } from "typescript";
require("dotenv").config();

function getChanges() {
    async function plan() {
        const dsb = new Dsbmobile(
            process.env.dsbusername,
            process.env.password,
        );
        await dsb.fetchToken();

        let tgi11_4 = await dsb.getTimetable();
        let entries = tgi11_4.findByClassName("TGI11/4");
        return entries;
    }

    plan().then((timeTable) => {
        console.log(timeTable);
    });
}
