import { Collection, Db, Document, IndexDescription, ObjectId, OptionalUnlessRequiredId } from 'mongodb'
import { InsertData } from '../types/types';
import {HookType} from './hooks/HookType'
import { Database } from './Database';
import { Field } from './fields/Field';
import { Hook } from './hooks/Hook';
import { Validator } from './validators/Validator';
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

    addValidator(validator: Validator<T>): this {
        this.validators.push(validator);
        return this;
    }

    addField(name:string, field: Field<any>):this{
        this.fields[name] = field

        const fieldHooks = field.getOptions().hooks;
        if(fieldHooks){
            for(const [hookType, hooks] of Object.entries(fieldHooks)){
                for(const hook of hooks){
                    this.addHook(hookType as HookType, hook);
                }
            }
        }
        const fieldOptions = field.getOptions()
        if(fieldOptions.index
            || fieldOptions.unique
        ){
           const indexOptions: IndexDescription = {
            key: {[name]:1},
            unique: fieldOptions.unique || false,
           } 
           this.indexes.push(indexOptions)
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

            await this.db.getDatabase().command({
                collMod: this.collection.collectionName,
                validator
            })
        }
    }

    async save(data: OptionalUnlessRequiredId<T>): Promise<ObjectId> {
        for (const [fieldName, field] of Object.entries(this.fields)) {
            const fieldOptions = field.getOptions();
            if (fieldOptions.required && data[fieldName] === undefined) {
                throw new Error(`Missing required field: ${fieldName}`);
            }
        }

        for(const [fieldName, field] of Object.entries(this.fields)){
            const fieldOptions = field.getOptions();
            if(fieldOptions.default !== undefined && data[fieldName] === undefined){
                data[fieldName] = fieldOptions.default;
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
        }
        await this.ensureSchemaValidation();
        await this.ensureIndexes();
        const result = await this.collection.insertOne(data);
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
