import { ClientSession, Collection, Db, Document, Filter, FindOptions, IndexDescription, ObjectId, OptionalUnlessRequiredId, UpdateResult } from 'mongodb'
import { InsertData } from '../types/types';
import {HookType} from './hooks/HookType'
import { Database } from './Database';
import { Field } from './fields/Field';
import { Hook } from './hooks/Hook';
import { Validator } from './validators/Validator';
import { NestedField } from './fields/NestedField';
import { RelationshipMetadata, RelationshipType } from './relationships/RelationshipType';
import { Plugin } from './plugin/plugin';
import {ERROR_CODES, MongridError} from '../error/MongridError'

export class Model<T extends Document> {
    private collection: Collection<T>;
    private hooks: {[key in HookType]?: Hook<T>[]} = {};
    private validators: Validator<T>[] = [];
    private indexes: IndexDescription[] = [];
    private fields: {[key:string]: Field<any>} = {};
    private relationships: {[key: string]: RelationshipMetadata<T, any>} = {};
    private plugins: Plugin<T>[] = []; // Array of plugin instances>

    use(plugin: Plugin<T>) {
        this.plugins.push(plugin);
        plugin.install(this);
        return this;
    }

    /**
     * Construct a model class.
     * @param db The database connection.
     * @param collectionName The name of the collection.
     */
    constructor(private db: Database, collectionName: string) {
        this.collection = db.getCollection<T>(collectionName);
    }

    /**
     * Add a hook to be executed when a certain event occurs.
     * @param type The event type (e.g. preSave, postSave, preUpdate, postUpdate, preRemove, postRemove)
     * @param hook The hook to be executed.
     * @returns The model instance.
     */
    addHook(type: HookType, hook: Hook<T>): this {
        if(!this.hooks[type]){
            this.hooks[type] = [];
        }
        this.hooks[type].push(hook);
        return this;
    }

/**
 * Executes all hooks of a given type for the specified document.
 * @param type The type of the hooks to execute (e.g., preSave, postSave).
 * @param document The document being processed through the hooks.
 * @returns A promise that resolves when all hooks have been executed.
 */

    private async executeHooks(type: HookType, document: T): Promise<void>{
        if (this.hooks[type]) {
            for (const hook of this.hooks[type]!) {
                try {
                    await hook.execute(document);
                } catch (error:any) {
                    throw new MongridError(
                        `Hook execution failed: ${error.message}`,
                        ERROR_CODES.HOOK_EXECUTION_ERROR,
                        {
                            hookType: type, document
                        }
                    )
                }
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
            throw new MongridError(
                "Document validation failed",
                ERROR_CODES.VALIDATION_ERROR,
                {errors}
            );
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

    private async ensureCollection(): Promise<void>  {
        const collections = await this.db.getDatabase().listCollections({
            name: this.collection.collectionName
        }).toArray();
        if(collections.length === 0){
            await this.db.getDatabase().createCollection(this.collection.collectionName);
        }
        await this.ensureSchemaValidation()
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
           
        }
        

        await this.db.getDatabase().command({
            collMod: this.collection.collectionName,
            validator,
            validationLevel: 'strict',
        validationAction: 'error',
        })
    }

    async find<K extends keyof T>(
        filter: Filter<T> = {},
        options: FindOptions = {},
        populatedFields: K[] = []
    ): Promise<T[]>{
        const aggregationPipeline: any[] = [{ $match: filter }];

        for (const fieldName of populatedFields){
            const relationship = this.relationships[fieldName as string];
            if(relationship){
                const relatedModel = relationship.relatedModel;
                const foreignKey = relationship.foreignKey;
                aggregationPipeline.push({
                    $lookup: {
                        from: relatedModel.collection.collectionName,
                        localField: foreignKey,
                        foreignField: '_id',
                        as: fieldName as string,
                    },
                });

                if (relationship.type === RelationshipType.OneToOne || relationship.type === RelationshipType.OneToMany){
                    aggregationPipeline.push({
                        $unwind: {
                            path: `$${fieldName as string}`,
                            preserveNullAndEmptyArrays: true,
                        },
                    });
                }
            }
        }
        const documents = await this.collection.aggregate<T>(aggregationPipeline).toArray();
        return documents;
    }

    async findById<K extends keyof T>(
        id: ObjectId,
        populatedFields: K[] = []
    ): Promise<T | null> {
        const document = await this.find({_id: id} as Filter<T>, {}, populatedFields);
        return document[0] || null;
    }

    async updateById(id: ObjectId, data: Partial<T>, options?: {session?: ClientSession}): Promise<UpdateResult<T>>{
        return await this.collection.updateOne({_id: id} as Filter<T>, {$set: data}, {session: options?.session});
    }

    addRelationship<R extends Document>(
        fieldName: keyof T & string,
        relationshipMetadata: RelationshipMetadata<T, R>,
    ): this{
        this.relationships[fieldName] = relationshipMetadata;
        return this
    }

   
    

    async save(data: OptionalUnlessRequiredId<T>, options?: {session?: ClientSession}): Promise<ObjectId> {
    await this.ensureCollection();
        await this.validateDocument(data);

        for (const [fieldName, field] of Object.entries(this.fields)) {
            const fieldOptions = field.getOptions();
            if (fieldOptions.required && data[fieldName] === undefined) {
                throw new Error(`Missing required field: ${fieldName}`);
            }
        }

        for (const [fieldName, relationship] of Object.entries(this.relationships)){
            const foreignKeyValue = data[fieldName];
            
            if(foreignKeyValue){
                const relatedModel = relationship.relatedModel;
                const relatedDocument = await relatedModel.findById(foreignKeyValue);
                
                if(!relatedDocument){
                    throw new Error(`Foreign key violation: ${fieldName} references a non-existent document.`)
                }
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
        const result = await this.collection.updateOne(
            { _id: aliasedData._id },
            { $set: aliasedData },
            { upsert: true, session: options?.session }
        );
        
        await this.executeHooks(HookType.PostSave, aliasedData);
        return aliasedData?._id || result.upsertedId!;
    }

    private getBsonType(type: any): string{
        if(type === String) return 'string';
        if(type === Number) return 'number';
        if(type === Boolean) return 'bool';
        if(type === Date) return 'date';
        if(type === Array) return 'array';
        if(type === Object) return 'object';
        if(type == ObjectId) return 'objectId';
        return 'string'
    }
}
