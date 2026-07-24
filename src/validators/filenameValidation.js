export default function filenameValidation(userInput){
 if(userInput == null){
    return null;
 }

 let filename = userInput.trim();

 filename = filename.split(".")[0].trim();

 if(!(/^[a-zA-Z0-9_-]+$/.test(filename))){
    throw new Error("Invalid Filename: Must consist of A-Z, a-z, 0-9, '-', '_' ")
 }
 return `${filename}.json`

}