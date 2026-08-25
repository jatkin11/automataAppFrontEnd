/**
 * Validation for user-inputted Word
 * 
 * word cannot contain any white space, only chars listed below
 * 
 * word can be blank, as it represents Epsilon
 * 
 * @param userInput user-inputted word to test
 * @returns user-inputted word
 * @throws {Error} if input is null or word is invalid i.e. not constist only of A-Z,a-z,0-9
 */

export default function wordValidation(userInput){
 if(userInput === null){
    throw new Error("Word input cannot be null");
}

if(!(/^[a-zA-Z0-9]*$/.test(userInput))){
    throw new Error("Invalid Word Entry: Must be 0-9, A-Z, a-z");
 }

 return userInput;

}