import 'reflect-metadata';

const HOOKS_METADATA_KEY = 'hooks';


/**
 * Decorator to register a method as a "before create" hook.
 */
export function BeforeCreate() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const hooks = Reflect.getMetadata(HOOKS_METADATA_KEY, target) || [];
        hooks.push({ type: 'beforeCreate', method: propertyKey });
        Reflect.defineMetadata(HOOKS_METADATA_KEY, hooks, target);
    };
}

/**
 * Decorator to register a method as an "after create" hook.
 */
export function AfterCreate() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const hooks = Reflect.getMetadata(HOOKS_METADATA_KEY, target) || [];
        hooks.push({ type: 'afterCreate', method: propertyKey });
        Reflect.defineMetadata(HOOKS_METADATA_KEY, hooks, target);
    };
}


/**
 * Decorator to register a method as an "after update" hook.
 */
export function AfterUpdate() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const hooks = Reflect.getMetadata(HOOKS_METADATA_KEY, target) || [];
        hooks.push({ type: 'afterUpdate', method: propertyKey });
        Reflect.defineMetadata(HOOKS_METADATA_KEY, hooks, target);
    };
}

/**
 * Decorator to register a method as a "before delete" hook.
 */
export function BeforeDelete() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const hooks = Reflect.getMetadata(HOOKS_METADATA_KEY, target) || [];
        hooks.push({ type: 'beforeDelete', method: propertyKey });
        Reflect.defineMetadata(HOOKS_METADATA_KEY, hooks, target);
    };
}

/**
 * Decorator to register a method as an "after delete" hook.
 */
export function AfterDelete() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const hooks = Reflect.getMetadata(HOOKS_METADATA_KEY, target) || [];
        hooks.push({ type: 'afterDelete', method: propertyKey });
        Reflect.defineMetadata(HOOKS_METADATA_KEY, hooks, target);
    };
}

/**
 * Decorator to register a method as a "before find" hook.
 */
export function BeforeFind() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const hooks = Reflect.getMetadata(HOOKS_METADATA_KEY, target) || [];
        hooks.push({ type: 'beforeFind', method: propertyKey });
        Reflect.defineMetadata(HOOKS_METADATA_KEY, hooks, target);
    };
}

/**
 * Decorator to register a method as an "after find" hook.
 */
export function AfterFind() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const hooks = Reflect.getMetadata(HOOKS_METADATA_KEY, target) || [];
        hooks.push({ type: 'afterFind', method: propertyKey });
        Reflect.defineMetadata(HOOKS_METADATA_KEY, hooks, target);
    };
}
