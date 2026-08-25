/**
 * Node ID generator
 * 
 * Provides string of next positive available int based on passed nodes array
 * 
 * @param nodes array of nodes
 * @returns string of next non-negative available int 
 */

export function nextId(nodes){
    let newId = 0;
    while(nodes.some((node) => node.id === String(newId))){
        newId++;
    }
    return String(newId);
}