export function nextId(nodes){
    let newId = 0;
    while(nodes.some((node) => node.id ===`q${newId}`)){
        newId++;
    }
    return `q${newId}`;
}