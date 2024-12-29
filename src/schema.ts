import { SchemaType } from './types/types'
// import {} from '../src/'

export class Schema<T extends SchemaType>{
    constructor(private schema: T){}
}
