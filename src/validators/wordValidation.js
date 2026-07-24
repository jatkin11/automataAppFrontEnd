export default function wordValidation(userInput){
 if(userInput === null){
    throw new Error("Word input cannot be null");
}

if(!(/^[a-zA-Z0-9]*$/.test(userInput))){
    throw new Error("Invalid Word Entry: Must be 0-9, A-Z, a-z");
 }

 return userInput;

}