import edgeSymbolValidation from "./edgeSymbolValidation";

export function validateGraph(graph){
    if(!graph || typeof graph !== "object"){
        throw new Error("Invalid Graph: Graph cannot be null");
    }

    if(graph.nodes === null){
        throw new Error("Invalid Graph: Graph nodes cannot be null");
    }

    if(graph.edges === null){
        throw new Error("Invalid Graph: Graph edges cannot be null");
    }

    if(!Array.isArray(graph.nodes)){
        throw new Error("Invalid Graph: Graph nodes must be an array");
    }

    if(!Array.isArray(graph.edges)){
        throw new Error("Invalid Graph: Graph edges must be an array");
    }

    if(graph.nodes.length === 0){
        throw new Error("Invalid Graph: Graph must have at least one node");
    }

    const nodeIds = new Set();
    const edgeIds = new Set();
    let startNodeCount = 0;

    for(const node of graph.nodes){
        if(!node || typeof node !== "object"){
        throw new Error("Invalid Graph: Invalid Node");
        }

        if(typeof node.id !== "string" || !/^[0-9]+$/.test(node.id)){
            throw new Error(`Invalid Graph: Invalid Node: ${node.id}`)
        }

        if(nodeIds.has(node.id)){
            throw new Error(`Invalid Graph: Duplicated Node ID: ${node.id}`)
        }

        if(!node.data || typeof node.data !== "object"){
            throw new Error(`Invalid Graph: Node missing data:  Node ID: ${node.id}`)
        }

        if(typeof node.data.label !== "string" || node.data.label.trim()=== ""){
            throw new Error(`Invalid Graph: Node missing data label:  Node ID: ${node.id}`)
        }

        if(typeof node.data.startingState !== "boolean"){
             throw new Error(`Invalid Graph: Node missing data (starting state):  Node ID: ${node.id}`)
        }

        if(typeof node.data.acceptingState !== "boolean"){
             throw new Error(`Invalid Graph: Node missing data (accepting state):  Node ID: ${node.id}`)
        }


        if(node.data.startingState){
            startNodeCount++;
        }
        nodeIds.add(node.id);

    }

    if(startNodeCount!==1){
        throw new Error("Invalid Graph: Graph must contain exactly 1 starting state");
    }

    for(const edge of graph.edges){
        if(!edge || typeof edge !== "object"){
            throw new Error("Invalid Graph: Invalid Edge");
        }

        if(typeof edge.id !== "string" || edge.id ===""){
            throw new Error("Edge Id must be a non-empty string");
        } 

        if(typeof edge.source !== "string" || typeof edge.target !== "string"){
            throw new Error("Edges source/targets must be a string");
        }

        if(!nodeIds.has(edge.source) || !nodeIds.has(edge.target)){
            throw new Error(`Invalid Graph: Edge source/target relates to unknown node: Edge ID: ${edge.id}`)
        }
    
        if(typeof edge.label !== "string"){
            throw new Error("Edge label must be a valid string");
        }

        edgeSymbolValidation(edge.label);

        if(edgeIds.has(edge.id)){
            throw new Error(`Invalid Graph: Duplicated Edge ID: ${edge.id}`)
        }

        edgeIds.add(edge.id);

    }
    
}