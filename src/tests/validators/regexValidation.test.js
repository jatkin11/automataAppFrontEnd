import regexValidation from "../../validators/regexValidation";
import {describe,test,expect} from "vitest";

describe("edgeSymbolValidation testing", () => {

    test("acceptsValidLetter", () => {
        expect(regexValidation("a")).toBe("a");
    });

    test("acceptsValidNumber", () => {
        expect(regexValidation("1")).toBe("1");
    });

    test("acceptsEpsilon", () => {
        expect(regexValidation("ε")).toBe("ε");
    });

    test("acceptsConcat", () => {
        expect(regexValidation("ab")).toBe("ab");
    });

    test("acceptsUnion", () => {
        expect(regexValidation("a|b")).toBe("a|b");
    });

    test("acceptsStarred", () => {
        expect(regexValidation("a*")).toBe("a*");
    });

    test("rejectsCommaSeparatedSymbols", () => {
        expect(()=>regexValidation("a,b,c")).toThrow();
    });

    test("rejectsIncorrectBracketing", () => {
        expect(()=>regexValidation("(a))")).toThrow();
    });

    test("rejectsInvalidSymbols", () => {
        expect(() => regexValidation("!!!")).toThrow();
    });

    test("whiteSpaceInBetweenIsRemoved", () => {
        expect(regexValidation("a bb c")).toBe("abbc");
    });

    test("rejectsEmptyInput", () => {
        expect(() => regexValidation("")).toThrow();
    });


} );