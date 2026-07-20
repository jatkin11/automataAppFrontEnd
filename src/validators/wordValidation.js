export default function wordValidation(userInput){
 if(userInput == null){
    return null;
 }

 let word = userInput.trim();

 if(word === ""){
    return null;
 }

 if(!(/^[a-zA-Z0-9]+$/.test(word))){
    return null;
 }

 return word;

}