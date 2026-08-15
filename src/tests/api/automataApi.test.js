import { apiConvertToDFA,
    apiRegexToNFA,
    apiConvertToString,
    apiTestWordOnAutomata,
    apiTestWordOnRegex,
    apiMinimiseDFA } from "../../api/automataApi";


import { describe,
    test,
    expect,
} from "vitest";


const validGraph = {
    automataType: "NFA",
    nodes: [{
        id: "0",
        position: {x: 0, y: 0},
        data: {label: "q0", startingState: true, acceptingState: true},
        type: "custom",
    }],
    edges: [],
}

const invalidGraph = {
    automataType: "NFA",
    nodes: null,
    edges: null,
}



describe("Automata API Testing", () => {

    test("apiConvertToDfaValidRequestSendsAndGetsCorrectResponse", async ()=> {
        const response = await apiConvertToDFA(validGraph);
        expect(response.automataType).toBe("DFA");

    });

    test("apiConvertToDfaInvalidRequestsThrowsError", async ()=> {
        await expect(apiConvertToDFA(invalidGraph)).rejects.toThrow();
    });


    test("apiRegexToNfaValidRequestSendsAndGetCorrectReponse", async ()=> {
        const response = await apiRegexToNFA("abc")
        expect(response.automataType).toBe("NFA");
    });

    test("apiRegexToNfaInvalidRequestsThrowsError",async ()=> {
        await expect(apiRegexToNFA("!!!")).rejects.toThrow();
    });

    test("apiConvertToStringValidRequestSendsAndReturnsCorrectly", async()=> {
        const response = await apiConvertToString(validGraph)
        expect(response.regex).toBe("ε");
    });

    test("apiConvertToStringInvalidRequestsGetsBadRequestResposne",  async ()=> {
        await expect(apiConvertToString(invalidGraph)).rejects.toThrow();
    });


    test("apiTestWordOnAutomataValidRequestSendsAndGetsOkResponse", async()=> {
        const response = await apiTestWordOnAutomata(validGraph,"")
        expect(response.accepted).toBe(true);


    });

    test("apiTestWordOnAutomataInvalidRequestsGetsBadRequestResposne",  async()=> {
         await expect(apiTestWordOnAutomata(invalidGraph,"@@@")).rejects.toThrow();
    });


    test("apiTestWordOnRegexValidRequestSendsAndGetsOkResponse", async()=> {
        const response = await apiTestWordOnRegex("abc","abc")
        expect(response.accepted).toBe(true);


    });

   test("apiTestWordOnRegexInvalidRequestsGetsBadRequestResposne", async()=> {
        await expect(apiTestWordOnRegex("@@@", "!!!")).rejects.toThrow();

    });

    
    test("apiMinimiseDfaValidRequestSendsAndGetsOkResponse", async()=> {
        const response = await apiMinimiseDFA(validGraph)
        expect(response.automataType).toBe("DFA");


    });

    test("apiMinimiseDfaInvalidRequestsGetsBadRequestResposne", async()=> {
        await expect(apiMinimiseDFA(invalidGraph)).rejects.toThrow();

    });


});

