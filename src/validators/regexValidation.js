const UNION = '|' ;
const STAR = '*';
const OPEN_BRACKET = '(';
const CLOSED_BRACKET = ')';

const PreviousChar = Object.freeze({
    NONE: "NONE",
    VALID_CHAR: "VALID_CHAR",
    OPEN_BRACKET: "OPEN_BRACKET",
    CLOSED_BRACKET: "CLOSED_BRACKET",
    UNION: "UNION",
    STAR: "STAR",
});

export default function regexValidation(userInput){
    if(userInput === null){
        throw new Error("Regex Input cannot be null")
    }

    const regex = userInput.replaceAll(/\s+/g, "");

    if(regex.length === 0){
                throw new Error("Regex cannot be empty")}

    const stack = [];
    let previousChar = PreviousChar.NONE;

    for(const char of regex){
        switch(char){
            case OPEN_BRACKET:                     
                    stack.push(OPEN_BRACKET);
                    previousChar = PreviousChar.OPEN_BRACKET;
                    break;
            case CLOSED_BRACKET:
                    if(stack.length === 0){
                    throw new Error("Invalid Regex: Incorrect Bracket structure");
                    }
                    if(previousChar === PreviousChar.OPEN_BRACKET || previousChar === PreviousChar.UNION){
                    throw new Error("Invalid Regex: Incorrect Bracket structure");
                    }
                    stack.pop();
                    previousChar = PreviousChar.CLOSED_BRACKET;
                    break;
            case UNION:
                    if(previousChar === PreviousChar.NONE || previousChar === PreviousChar.OPEN_BRACKET || previousChar === PreviousChar.UNION){
                    throw new Error("Invalid Regex: Invalid Union");
                    }
                    previousChar = PreviousChar.UNION;
                    break;
            case STAR:
                    if(previousChar !== PreviousChar.VALID_CHAR && previousChar !== PreviousChar.CLOSED_BRACKET){
                        throw new Error("Invalid Regex: Invalid star");
                    }
                    previousChar = PreviousChar.STAR;
                    break;
            default:
                    if(!(/^[a-zA-Z0-9ε∅]$/.test(char))){
                    throw new Error("Invalid Regex! Must consist of A-Z, a-z, 0-9, '()', 'ε', '∅', '|', '*'");
                    }
                    previousChar = PreviousChar.VALID_CHAR;
                    break;
        }
    }

    if(previousChar === PreviousChar.UNION || previousChar === PreviousChar.OPEN_BRACKET){
        throw new Error("Invalid regex: cannot end on '(' or '|' ");
    }

    if(stack.length !== 0){
        throw new Error("Invalid regex: missing closing bracket");
    }
    return regex;
}