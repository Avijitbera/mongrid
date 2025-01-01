import { Document, Filter, FindOptions } from 'mongodb';
import {Model} from '../model/model'
import { ModelExtension, QueryHandlers } from './types'
import { handleAfterFind, handleBeforeFind } from './handlers/find';
import { handleAfterCreate, handleBeforeCreate } from './handlers/create';

export class ExtensionManager{
    private extensions: Map<string, ModelExtension> = new Map();
    private queryHandlers: QueryHandlers[] = [];

    constructor(private model: Model<any>){}

    register(name:string, extensions: ModelExtension): void {
        if(this.extensions.has(name)){
            throw new Error(`Extension "${name}" is already registered`)
        }

        if(extensions.methods){
            this.registerMethods(extensions.methods);
        }

        if(extensions.statics){
            this.registerStatics(extensions.statics);
        }

        if(extensions.queryHandlers){
            this.queryHandlers.push(extensions.queryHandlers);
        }
        if(extensions.queryHandlers){
            this.queryHandlers.push(extensions.queryHandlers);
        }
        this.extensions.set(name, extensions);
    }

    private registerStatics(statics: Record<string, Function>): void{
        Object.entries(statics).forEach(([methodName, fn]) => {
            if((this.model.constructor as any)[methodName]){
                throw new Error(`Static method "${methodName}" already exists on model`)
            }
            (this.model as any)[methodName] = fn;
        })
    }

    private registerMethods(methods: Record<string, Function>): void{
        Object.entries(methods).forEach(([methodName, fn]) => {
            if((this.model as any)[methodName]){
                throw new Error(`Method "${methodName}" already exists on model`)
            }
            (this.model as any)[methodName] = fn.bind(this.model);;
        })
    }

    /**
     * Applies all registered query handlers for the given phase and arguments.
     * 
     * @param phase The phase of the query handlers to apply. Must be one of the
     * properties of the `QueryHandlers` interface.
     * 
     * @param args The arguments to pass to the query handlers.
     * 
     * @returns The result of applying all query handlers. The result may be
     * modified by one or more query handlers.
     */
    async applyQueryHandlers<T extends Document>(
        phase: keyof QueryHandlers,
        args: unknown[]
    ): Promise<unknown>{
        let result = args;
        for(const handlers of this.queryHandlers){
            const handler = handlers[phase];
            if(!handler) continue
            try {
                switch(phase){
                    case 'beforeFind':
                        result = await handleBeforeFind(handler as QueryHandlers['beforeFind'], result);
                        break;
                    case 'afterFind':
                        result = [await handleAfterFind(handler as QueryHandlers['afterFind'], result)];
                        break;
                    case 'beforeCreate':
                        result = [await handleBeforeCreate(handler as QueryHandlers['beforeCreate'], result)];
                        break;
                    case 'afterCreate':
                        result =[ await handleAfterCreate(handler as QueryHandlers['afterCreate'], result)];
                        break;
                    // case 'beforeUpdate':
                    //     result = await handleBeforeUpdate(handler, result);
                    //     break;
                    // case 'afterUpdate':
                    //     result = await handleAfterUpdate(handler, result);
                    //     break;
                    // case 'beforeDelete':
                    //     result = await handleBeforeDelete(handler, result);
                    default:
                        result = [];
                }
            } catch (error) {
                console.log(`Error in ${phase} handler: ${error}`);
                throw error
            }
        }
        return Array.isArray(result) && result.length === 1 ? result[0] : result
    }

    getExtension(name:string):ModelExtension | undefined {
        return this.extensions.get(name)
    }

}


