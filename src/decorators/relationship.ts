import 'reflect-metadata';

const RELATIONSHIP_METADATA_KEY = 'relationship';


/**
 * Decorator to define a one-to-one relationship.
 * @param targetModel - The target model class.
 * @param foreignKey - The foreign key field (optional).
 */
export function OneToOne(targetModel:Function, foreignKey?: string){
    return function (target: any, propertyKey: string) {
        Reflect.defineMetadata(RELATIONSHIP_METADATA_KEY, { type: 'one-to-one', targetModel, foreignKey }, target, propertyKey);
    };
}

/**
 * Decorator to define a one-to-many relationship.
 * @param targetModel - The target model class.
 * @param foreignKey - The foreign key field (optional).
 */
export function OneToMany(targetModel: Function, foreignKey?: string) {
    return function (target: any, propertyKey: string) {
        Reflect.defineMetadata(RELATIONSHIP_METADATA_KEY, { type: 'one-to-many', targetModel, foreignKey }, target, propertyKey);
    };
}