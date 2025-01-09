import { OptionalUnlessRequiredId } from "mongodb";

export abstract class Validator<T> {
   
   /**
     * Validates the given document.
     * @param document The document to validate.
     * @returns An object where keys are field names and values are arrays of error messages.
     */
   abstract validate(document: T): { [key in keyof T]?: string[] };
}
