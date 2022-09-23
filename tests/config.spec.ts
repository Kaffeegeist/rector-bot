import { expect } from "chai";
import { Entry } from "dsbmobile";
import { Config } from "../src/config";

describe("Test Config", () => {
    it("remove Guild", () => {
        const c = new Config();
        expect(c.responseMap.size).to.be.greaterThan(0);
        expect(c.responseMap.get("test")).to.be.undefined;
        expect(c.responseMap.get("vertretung")).to.equal(
            "PERIOD. Stunde Vertretung jetzt NEW_SUBJECT in NEW_ROOM",
        );

        const entry = new Entry(
            new Date(),
            "Montag",
            [],
            1,
            "Vertretung",
            "test",
            "E",
            "test",
            "312",
            "test",
        );

        expect(c.getResponse(entry)).to.equal("1. Stunde Vertretung jetzt E in 312");
    });
});
