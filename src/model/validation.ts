import {Schema} from '../schema'
import {SchemaType} from '../types/types'


export class ModelValidation<T extends SchemaType> {
    constructor(private schema: Schema<T>){}

    async validate(data: any): Promise<boolean> {
        this.schema.validate(data);
    
        return true;
    }

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
