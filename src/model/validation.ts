import {Schema} from '../schema'
import {SchemaType} from '../types/types'


export class ModelValidation<T extends SchemaType> {
    constructor(private schema: Schema<T>){}

    /**
     * Validates the provided data against the schema's defined types and custom
     * validation rules.
     * 
     * @param data The data to validate.
     * @returns A promise that resolves to true if the data is valid, or rejects with an
     *          error if the data is invalid.
     */
    async validate(data: any): Promise<boolean> {
        this.schema.validate(data);
    
        return true;
    }

/**
 * Validates custom rules defined in the schema for each field in the provided data.
 * 
 * Iterates over each field in the schema, and if a custom validation function
 * is defined for that field and the field exists in the data, it executes the validation function.
 * 
 * @param data - The data object containing fields to be validated against the custom rules.
 * @throws Error - If any field fails its custom validation rule.
 */

    private async validateCustomRules(data:any): Promise<void>{
        const schema = this.schema.getSchema();

        for(const [field, config] of Object.entries(schema)){
            if(config.validate && data[field] !== undefined){
                const isValid = await config.validate(data[field])
                if(!isValid){
                    throw new Error(`${field} failed custom validation`)
                }
            }
        }
    }
}
