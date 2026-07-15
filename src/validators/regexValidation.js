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
    if(userInput == null){
        return false;
    }

    const regex = userInput.trim();

    if(regex.length === 0){
        return false;
    }

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
                    return false;
                    }
                    if(previousChar === PreviousChar.OPEN_BRACKET || previousChar === PreviousChar.UNION){
                        return false;
                    }
                    stack.pop();
                    previousChar = PreviousChar.CLOSED_BRACKET;
                    break;
            case UNION:
                    if(previousChar === PreviousChar.NONE || previousChar === PreviousChar.OPEN_BRACKET || previousChar === PreviousChar.UNION){
                    return false;
                    }
                    previousChar = PreviousChar.UNION;
                    break;
            case STAR:
                    if(previousChar !== PreviousChar.VALID_CHAR && previousChar !== PreviousChar.CLOSED_BRACKET){
                    return false;
                    }
                    previousChar = PreviousChar.STAR;
                    break;
            default:
                    if(!(/^[a-zA-Z0-9ε∅]$/.test(char))){
                    return false;}
                    previousChar = PreviousChar.VALID_CHAR;
                    break;
        }
    }

    if(previousChar === PreviousChar.UNION || previousChar === PreviousChar.OPEN_BRACKET){
        return false;
    }
    
    return stack.length === 0;
}