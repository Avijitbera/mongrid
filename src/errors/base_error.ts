import {Filter} from 'mongodb'
import {ModelDocument, ModelQueryOptions} from '../types/model'

export abstract class BaseModelError extends Error {
    constructor(
        public readonly operation: string,
        public readonly filter?: Filter<ModelDocument<any>>,
        public readonly options?: ModelQueryOptions,
        public readonly cause?: unknown
    ){
        super(`Error is ${operation} operation`)
        this.name = this.constructor.name;
    }

    abstract getDetails(): Record<string, unknown>;
}