import { Collection, Db, Document, IndexDescription, ObjectId, OptionalUnlessRequiredId } from 'mongodb'
import { InsertData } from '../types/types';
import {HookType} from './hooks/HookType'
import { Database } from './Database';
import { Field } from './fields/Field';
import { Hook } from './hooks/Hook';
import { Validator } from './validators/Validator';
import { NestedField } from './fields/NestedField';
interface BaseDocument {
    _id?: ObjectId;
}

export class Model<T extends Document> {
    private collection: Collection<T>;
    private hooks: {[key in HookType]?: Hook<T>[]} = {};
    private validators: Validator<T>[] = [];
    private indexes: IndexDescription[] = [];
    private fields: {[key:string]: Field<any>} = {};



    /**
     * Construct a model class.
     * @param db The database connection.
     * @param collectionName The name of the collection.
     */
    constructor(private db: Database, collectionName: string) {
        this.collection = db.getCollection<T>(collectionName);
    }

    addHook(type: HookType, hook: Hook<T>): this {
        if(!this.hooks[type]){
            this.hooks[type] = [];
        }
        this.hooks[type].push(hook);
        return this;
    }

    private async executeHooks(type: HookType, document: T): Promise<void>{
        if (this.hooks[type]) {
            for (const hook of this.hooks[type]!) {
                await hook.execute(document);
            }
        }
    }

    addValidator(validator: Validator<T>): this {
        this.validators.push(validator);
        return this;
    }

    private async validateDocument(document: T | OptionalUnlessRequiredId<T>): Promise<void>{
        // Check for required fields
        for (const [fieldName, field] of Object.entries(this.fields)) {
            const fieldOptions = field.getOptions();
            if (fieldOptions.required && document[fieldName] === undefined) {
                throw new Error(`Missing required field: ${fieldName}`);
            }
        }

        // Run all validators
        const errors: { [key in keyof T]?: string[] } = {};
        for (const validator of this.validators) {
            const validatorErrors = validator.validate(document as T);
            for (const [field, fieldErrors] of Object.entries(validatorErrors)) {
                if (!errors[field]) {
                    errors[field as keyof T] = [];
                }
                errors[field]!.push(...fieldErrors!);
            }
        }

        if (Object.keys(errors).length > 0) {
            const errorMessages = Object.entries(errors)
                .map(([field, fieldErrors]) => `${field}: ${fieldErrors!.join(', ')}`)
                .join('; ');
            throw new Error(errorMessages);
        }

    }

    addField(name:string, field: Field<any>):this{
        this.fields[name] = field
        const fieldOptions = field.getOptions();
        const fieldHooks = field.getOptions().hooks;
        if(fieldHooks){
            for(const [hookType, hooks] of Object.entries(fieldHooks)){
                for(const hook of hooks){
                    this.addHook(hookType as HookType, hook);
                }
            }
        }

        if(fieldOptions.validators){
            for(const validator of fieldOptions.validators){
                this.addValidator(validator)
            }
        }

      
        if(fieldOptions.index
            || fieldOptions.unique
        ){
           const indexOptions: IndexDescription = {
            key: {[name]:1},
            unique: fieldOptions.unique || false,
           } 
           this.indexes.push(indexOptions)
        }
        if(field instanceof NestedField){
            for (const [nestedFieldName, nestedField] of Object.entries(field.getFields())){
                const nestedFieldOptions = nestedField.getOptions();
                if(nestedFieldOptions.index
                    || nestedFieldOptions.unique
                ){
                   const indexOptions: IndexDescription = {
                    key: {[name]:1},
                    unique: nestedFieldOptions.unique || false,
                   } 
                   this.indexes.push(indexOptions)
                }
            }
        }
        return this;
    }

    async ensureIndexes(): Promise<void> {
        if (this.indexes.length > 0) {
            await this.collection.createIndexes(this.indexes);
        }
    }

    async ensureSchemaValidation(): Promise<void> {
        const validator: { $jsonSchema: any } = {
            $jsonSchema: {
                bsonType: 'object',
                required: [],
                properties: {},
            },
        };

        for(const [name, field] of Object.entries(this.fields)){
            const fieldOptions = field.getOptions()
            if(fieldOptions.required){
                validator.$jsonSchema.required.push(name);
            }

            validator.$jsonSchema.properties[name] = {
            
                bsonType: this.getBsonType(fieldOptions.type),
            }

            // if(fieldOptions.default !== undefined){
            //     validator.$jsonSchema.properties[name].default = fieldOptions.default
            // }

            if(field instanceof NestedField){
                validator.$jsonSchema.properties[name] = {
                    bsonType: 'object',
                    required: [],
                    properties: {},
                };

                for (const [nestedFieldName, nestedField] of Object.entries(field.getFields())){
                    const nestedFieldOptions = nestedField.getOptions();

                // Add to required array if the nested field is required
                if (nestedFieldOptions.required) {
                    validator.$jsonSchema.properties[name].required.push(nestedFieldName);
                }

                // Add nested field properties to the schema
                validator.$jsonSchema.properties[name].properties[nestedFieldName] = {
                    bsonType: this.getBsonType(nestedFieldOptions.type),
                };
                }
            }

            await this.db.getDatabase().command({
                collMod: this.collection.collectionName,
                validator
            })
        }
    }

    async save(data: OptionalUnlessRequiredId<T>): Promise<ObjectId> {
        await this.validateDocument(data);

        for (const [fieldName, field] of Object.entries(this.fields)) {
            const fieldOptions = field.getOptions();
            if (fieldOptions.required && data[fieldName] === undefined) {
                throw new Error(`Missing required field: ${fieldName}`);
            }
        }

         // Apply default values
    for (const [fieldName, field] of Object.entries(this.fields)) {
        const fieldOptions = field.getOptions();

        // Apply default value for the top-level field if it's missing
        if (fieldOptions.default !== undefined && data[fieldName] === undefined) {
            data[fieldName] = fieldOptions.default;
        }

        // Handle nested fields
        if (field instanceof NestedField) {
            // Ensure data[fieldName] is an object
            if (data[fieldName] === undefined) {
                data[fieldName] = {};
            }

            // Apply default values for nested fields if they are missing
            for (const [nestedFieldName, nestedField] of Object.entries(field.getFields())) {
                const nestedFieldOptions = nestedField.getOptions();
                if (nestedFieldOptions.default !== undefined && data[fieldName][nestedFieldName] === undefined) {
                    data[fieldName][nestedFieldName] = nestedFieldOptions.default;
                }
            }
        }
    }
        
        for (const [fieldName, field] of Object.entries(this.fields)) {
            const fieldOptions = field.getOptions();
            if(fieldOptions.transform && data[fieldName] !== undefined){
                data[fieldName] = fieldOptions.transform(data[fieldName]);
                
            }
        }
        

        const aliasedData:any = {}
        for(const [fieldName, field] of Object.entries(this.fields)){
            const fieldOptions = field.getOptions();
            const alias = fieldOptions.alias || fieldName;
            aliasedData[alias] = data[fieldName];
            
            if(field instanceof NestedField){
                
                aliasedData[alias] = {}
                for (const [nestedFieldName, nestedField] of Object.entries(field.getFields())) {
                    // console.log({nestedFieldName, nestedField})
                    const nestedFieldOptions = nestedField.getOptions();
                    const nestedAlias = nestedFieldOptions.alias || nestedFieldName;
                    // console.log({nestedAlias, fieldName, data: data})
                    aliasedData[alias][nestedAlias] = data[fieldName][nestedFieldName];
                }
                
            }else{
                aliasedData[alias] = data[fieldName];
            }
        }
        
        await this.ensureSchemaValidation();
        await this.ensureIndexes();
        await this.executeHooks(HookType.PreSave, aliasedData);
        const result = await this.collection.insertOne(aliasedData);
        await this.executeHooks(HookType.PostSave, aliasedData);
        return result.insertedId!;
    }

    private getBsonType(type: any): string{
        if(type === String) return 'string';
        if(type === Number) return 'number';
        if(type === Boolean) return 'bool';
        if(type === Date) return 'date';
        if(type === Array) return 'array';
        if(type === Object) return 'object';
        return 'string'
    }
}
