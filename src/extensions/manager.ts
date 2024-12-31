import { Document, Filter, FindOptions } from 'mongodb';
import {Model} from '../model/model'
import { ModelExtension, QueryHandlers } from './types'

export class ExtensionManager{
    private extensions: Map<string, ModelExtension> = new Map();
    private queryHandlers: QueryHandlers[] = [];

    constructor(private model: Model<any>){}

    register(name:string, extensions: ModelExtension): void {
        if(this.extensions.has(name)){
            throw new Error(`Extension "${name}" is already registered`)
        }

        if(extensions.methods){
            Object.entries(extensions.methods).forEach(([methodName, fn]) => {
                if((this.model as any)[methodName]){
                    throw new Error(`Method "${methodName}" already exists on model`)
                }
                (this.model as any)[methodName] = fn.bind(this.model);;
            })
        }

        if(extensions.statics){
            Object.entries(extensions.statics).forEach(([methodName, fn]) => {
                if((this.model.constructor as any)[methodName]){
                    throw new Error(`Static method "${methodName}" already exists on model`)
                }
                (this.model as any)[methodName] = fn;
            })
        }

        if(extensions.queryHandlers){
            this.queryHandlers.push(extensions.queryHandlers);
        }
        this.extensions.set(name, extensions);
    }

    async applyQueryHandlers<T extends Document>(
        phase: keyof QueryHandlers,
        args: T[]
    ): Promise<T[]>{
        let result = [...args];
        for(const handlers of this.queryHandlers){
            const handler = handlers[phase];
            if(handler){
                switch(phase){
                    case 'beforeFind':
                        
                }

            }
        }
        return result
    }


}


