import {} from 'mongodb'
import { ModelOptions, SchemaType } from '../types/types';

export class BaseModel<T extends SchemaType> {

    constructor(
        public options: ModelOptions = {},

    ){}
}
