import { nextId } from "../../utilties/GlobalNodeIdGenerator";


import {describe,test,expect} from "vitest";

describe("GlobalNodeIdGenerator testing", () => {

    
    test("generatesNextIdCorrectly", () => {
       const nodes = [{id: "0"},{id : "1"}];
        expect(nextId(nodes)).toBe("2");
    });


});