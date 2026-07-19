export default function filenameValidation(userInput){
 if(userInput == null){
    return null;
 }

 let filename = userInput.trim();

 filename = filename.split(".")[0];

 if(filename ===""){
    return null;
 }

 if(!(/^[a-zA-Z0-9_-]+$/.test(filename))){
    return null;
 }

 return `${filename}.json`

}