import edgeSymbolValidation from "../../validators/edgeSymbolValidation";
import {describe,test,expect} from "vitest";

describe("edgeSymbolValidation testing", () => {

    test("acceptsValidLetter", () => {
        expect(edgeSymbolValidation("a")).toBe("a");
    });

    test("acceptsValidNumber", () => {
        expect(edgeSymbolValidation("1")).toBe("1");
    });

    test("acceptsEpsilon", () => {
        expect(edgeSymbolValidation("ε")).toBe("ε");
    });


    test("acceptsCommaSeparatedSymbols", () => {
        expect(edgeSymbolValidation("a,b,c")).toBe("a,b,c");
    });

    test("rejectsInvalidSymbols", () => {
        expect(() => edgeSymbolValidation("!!!")).toThrow();
    });


    test("dupedSymbolsGetRemoved", () => {
        expect(edgeSymbolValidation("b,b")).toBe("b");
    });


    test("rejectsEmptyInput", () => {
        expect(() => edgeSymbolValidation("")).toThrow();
    });


} );