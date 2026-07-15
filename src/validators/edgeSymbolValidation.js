export default function edgeSymbolValidation(userInput){
    if(userInput == null){
        return null;
    }

    const symbols = userInput.split(",").map((symbol) => symbol.trim());

    if(symbols.some((symbol) => symbol === "")){
        window.alert("Must enter at least one symbol!");
        return null;
    }

    if(symbols.some((symbol) => !(/^[a-zA-Z0-9ε]$/.test(symbol)))){
        window.alert("Invalid Symbol entered, must be a-z, A-Z, 0-9 or ε ");
        return null;
    }

    if(symbols.some((symbol) => symbol.length !== 1)){
        window.alert("Each symbol must only be one character separated by a comma, e.g. 'a,b,c'");
        return null;
    }

    return[...new Set(symbols)].join(",");

}