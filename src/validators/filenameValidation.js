
/**
 * Validation for User-inputted Filename
 * 
 * - returns null if input is null
 * - trims whitespace
 * - removes any extenion i.e. anything after a '.'
 * - checks valid string made of valid chars i.e. A-Z,a-z,0-9, hyphen, underscore
 * - adds .json to the end
 * 
 * 
 * @param userInput user-inputted filename
 * @returns normalised filename.json
 * @throws {Error} if invalid filename
 */
export default function filenameValidation(userInput){
 if(userInput == null){
    return null;
 }

 let filename = userInput.trim();

 filename = filename.split(".")[0].trim();

 if(!(/^[a-zA-Z0-9_-]+$/.test(filename))){
    throw new Error("Invalid Filename: Must consist of A-Z, a-z, 0-9, '-', '_' ");
 }
 return `${filename}.json`;

}