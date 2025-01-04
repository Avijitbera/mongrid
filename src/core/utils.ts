/**
 * Check if a value is an object.
 */
export const isObject = (value:any):boolean => {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Deep merge two objects.
 */
export const deepMerge = (target:any, source:any):any =>{
    if(isObject(target) && isObject(source)){
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return target
}