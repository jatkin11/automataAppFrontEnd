import { describe,test,expect } from "vitest";

import filenameValidation from "../../validators/filenameValidation";

describe("filenameValidation testing:", ()=>{


        test("acceptsValidFilename", ()=>{
            expect(filenameValidation("test")).toBe("test.json")
        });

        test("acceptsNumbers", ()=>{
            expect(filenameValidation("123")).toBe("123.json")

       });


        test("acceptsLetters", ()=>{
            expect(filenameValidation("abc")).toBe("abc.json")

        });

        test("acceptsUnderscores", ()=>{
            expect(filenameValidation("a_b_c")).toBe("a_b_c.json")
      });


        test("acceptsHyphens", ()=>{
            expect(filenameValidation("a-b-c")).toBe("a-b-c.json")
        });

        test("correctlyNoramlisesByRemovingAfterDot", ()=>{
            expect(filenameValidation("test.invalidFileExtension")).toBe("test.json")
        });

        test("rejectsInvalidFilename", ()=>{
            expect(()=>filenameValidation("£££.JSON")).toThrow();

        });

        test("rejectsEmptyFilename", ()=>{
            expect(()=>filenameValidation("")).toThrow();

        });

});


