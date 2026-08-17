import { describe,test,expect } from "vitest";

import wordValidation from "../../validators/wordValidation";

describe("wordValidation testing:", ()=>{


        test("acceptsValidWord", ()=>{
            expect(wordValidation("")).toBe("");
        });

        test("acceptsLetter", ()=>{
            expect(wordValidation("")).toBe("");
        });

        test("acceptsNumbers", ()=>{
            expect(wordValidation("")).toBe("");
        });


        test("rejectsEpsilon", ()=>{
            expect(()=> wordValidation("ε")).toThrow();
        });

        test("rejectsWhiteSpace", ()=>{
            expect(()=> wordValidation("a b c")).toThrow();
        });


        test("rejectsInvalidWord", ()=>{
            expect(()=> wordValidation("@@@")).toThrow();
        });

});