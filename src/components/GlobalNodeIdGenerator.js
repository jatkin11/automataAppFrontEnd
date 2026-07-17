export function nextId(nodes){
    let newId = 0;
    while(nodes.some((node) => node.id === String(newId))){
        newId++;
    }
    return String(newId);
}