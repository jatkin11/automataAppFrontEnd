export default function edgeSymbolValidation(userInput){
    if(userInput === null){
        return null;
    }

    const symbols = userInput.split(",").map((symbol) => symbol.trim());

    if(symbols.some((symbol) => symbol === "")){
        throw new Error("Must enter at least one symbol!");
    }

    if(symbols.some((symbol) => !(/^[a-zA-Z0-9ε]$/.test(symbol)))){
        throw new Error("Invalid Symbol entered, must be a-z, A-Z, 0-9 or ε ");
    }

    if(symbols.some((symbol) => symbol.length !== 1)){
        throw new Error("Each symbol must only be one character separated by a comma, e.g. 'a,b,c'");
    }

    return[...new Set(symbols)].join(",");

}