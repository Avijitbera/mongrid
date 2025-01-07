import 'reflect-metadata'

const COLLECTION_METADATA_KEY = 'collection'

/**
 * Decorator to specify the MongoDB collection name for a model.
 * @param name - The name of the collection.
 */
export function Collection(name:string){
    return function (target: Function){
        
    }
}