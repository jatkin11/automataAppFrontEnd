import { describe,test,expect } from "vitest";

import { validateGraph } from "../../validators/graphValidation";

const validGraph = {
    nodes: [{id: "0", position: {x:0,y:0}, data: {label: "q0", startingState: true, acceptingState: false}, type: "custom"}],
    edges: [],
};

const invalidGraph = {
    nodes: [{id: null, position: {x:0,y:0}, data: {label: "q0", startingState: false, acceptingState: false}, type: "custom"}],
    edges: [],
};

const graphContainingAnEdgeToAnUnknownNode = {
    nodes: [{id: "0", position: {x:0,y:0}, data: {label: "q0", startingState: true, acceptingState: false}, type: "custom"}],
    edges: [{id: "0->1", label: "a", source: "0", target: "1", type:"default"}],
};

const graphWithNoNodeArray = {
    edges: [],
};

const graphWithNoEdgeArray = {
    nodes: [],
};


describe("graphValidation testing:", ()=>{


        test("acceptsValidGraph", ()=>{
            expect(()=>validateGraph(validGraph)).not.toThrow();
        });


        test("throwsWithNullGraph", ()=>{
            expect(()=>validateGraph(null)).toThrow();
        });


        test("throwsWithGraphWithNoNodeArray", ()=>{
            expect(()=>validateGraph(graphWithNoNodeArray)).toThrow();

        });


        test("throwsWithGraphWithNoEdgeArray", ()=>{
            expect(()=>validateGraph(graphWithNoEdgeArray)).toThrow();

        });


        test("throwsWithInvalidGraph", ()=>{
            expect(()=>validateGraph(invalidGraph)).toThrow();

        });


        test("throwsWithAGraphWithAnEdgeContainingAnUnknownNode", ()=>{
            expect(()=>validateGraph(graphContainingAnEdgeToAnUnknownNode)).toThrow();

        });

});