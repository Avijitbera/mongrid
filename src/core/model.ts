import { ClientSession, Collection, Db, DeleteResult, Document, Filter, FindOptions, IndexDescription, ObjectId, OptionalUnlessRequiredId, UpdateFilter, UpdateResult } from 'mongodb'
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

    getCollection(): Collection<T> {
        return this.collection;
    }

    /**
     * Add a plugin to this model. The plugin will be executed when you call .install() on it.
     * @param plugin The plugin to add.
     * @returns The model instance.
     */
    use(plugin: Plugin<T>) {
        this.plugins.push(plugin);
        if (plugin.installModel) {
            plugin.installModel(this);
        }
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
     * @throws {MongridError} If a hook execution fails.
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
    /**
     * Adds a validator to the model.
     * @param validator The validator to add.
     * @returns The instance of the model for method chaining.
     */
    addValidator(validator: Validator<T>): this {
        this.validators.push(validator);
        return this;
    }
    /**
     * Validates the given document.
     * @param document The document to validate.
     * @throws {MongridError} If the document is invalid.
     * @returns A promise that resolves when the document has been validated.
     */
    private async validateDocument(document: T | OptionalUnlessRequiredId<T>): Promise<void>{
        // Check for required fields
        for (const [fieldName, field] of Object.entries(this.fields)) {
            const fieldOptions = field.getOptions();
            const value = document[fieldName];
            if (fieldOptions.required && document[fieldName] === undefined) {
                throw new Error(`Missing required field: ${fieldName}`);
            }

            if(value === null && !fieldOptions.nullable){
                throw new Error(`Field ${fieldName} is required and cannot be null`)
            }

            if(fieldOptions.enum && !fieldOptions.enum.includes(value)){
                throw new Error(`Field ${fieldName} must be one of ${fieldOptions.enum.join(', ')}`)
            }


            if(fieldOptions.min !== undefined){
                const min = typeof fieldOptions.min === "function" ? fieldOptions.min(document) : fieldOptions.min;
                if(value < min){
                    throw new Error(`Field ${fieldName} must be greater than ${min}`)
                }
            }

            if(fieldOptions.max !== undefined){
                const max = typeof fieldOptions.max === "function" ? fieldOptions.max(document) : fieldOptions.max;
                if(value > max){
                    throw new Error(`Field ${fieldName} must be less than ${max}`)
                }
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
    /**
     * Adds a field to the model.
     * @param name The name of the field.
     * @param field The field to add.
     * @returns The model instance.
     */
    addField(name:string, field: Field<any>):this{
        this.fields[name] = field
        const fieldOptions = field.getOptions();
        const fieldHooks = field.getOptions().hooks;
        
        if(fieldOptions.immutable){
            this.addHook(
                HookType.PreUpdate,
               {
        /**
         * If the field is set, throws an error.
         * @param document The document being updated.
         */
                execute: async(document: T) =>{
                    if(document[name] !== undefined){
                        throw new MongridError(
                            `Field ${name} is immutable`,
                            ERROR_CODES.FIELD_IS_IMMUTABLE,
                            {fieldName: name}
                        )
                    }
                }
               }
            )
        }
        
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
    /**
     * Ensures that the indexes specified in the model are created in the underlying collection.
     * This method is called automatically by the `ensureCollection` method.
     * @returns {Promise<void>} Resolves when the indexes have been created.
     */
    async ensureIndexes(): Promise<void> {
        if (this.indexes.length > 0) {
            await this.collection.createIndexes(this.indexes);
        }
    }
    /**
     * Ensures that the collection exists in the database. If the collection
     * does not exist, it is created. This method also ensures that schema
     * validation is applied to the collection.
     * @returns {Promise<void>} Resolves when the collection is ensured.
     */
    private async ensureCollection(): Promise<void>  {
        const collections = await this.db.getDatabase().listCollections({
            name: this.collection.collectionName
        }).toArray();
        if(collections.length === 0){
            await this.db.getDatabase().createCollection(this.collection.collectionName);
        }
        await this.ensureSchemaValidation()
    }
/**
 * Ensures that schema validation is applied to the collection. Constructs a JSON schema
 * validator based on the model's field definitions, including required fields, data types,
 * and nested fields. Updates the collection with the schema validator, enforcing strict
 * validation and errors on validation failures.
 * 
 * The validator includes properties for each field and nested field, defining their types
 * and required status. Immutable fields are marked as readOnly in the schema.
 * 
 * @returns {Promise<void>} Resolves when the schema validation is ensured.
 */
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

             // Add enum validation
             if (fieldOptions.enum) {
                validator.$jsonSchema.properties[name].enum = fieldOptions.enum;
            }

            if (fieldOptions.min !== undefined) {
                validator.$jsonSchema.properties[name].minimum = fieldOptions.min;
            }
            if (fieldOptions.max !== undefined) {
                validator.$jsonSchema.properties[name].maximum = fieldOptions.max;
            }

            // Add regex validation
            if (fieldOptions.regex) {
                validator.$jsonSchema.properties[name].pattern = fieldOptions.regex.source;
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

            if(fieldOptions.immutable){
                validator.$jsonSchema.properties[name].readOnly = true;
            }
           
        }
        

        await this.db.getDatabase().command({
            collMod: this.collection.collectionName,
            validator,
            validationLevel: 'strict',
        validationAction: 'error',
        })
    }
/**
     * Finds documents in the collection that match the given filter.
     * @param filter The filter to apply to the query.
     * @param options The MongoDB query options.
     * @param populatedFields The fields to populate with related documents.
     * @returns The found documents.
     */
    async find<K extends keyof T>(
        filter: Filter<T> = {},
        options: FindOptions = {},
        populatedFields: K[] = []
    ): Promise<T[]>{
        const aggregationPipeline: any[] = [{ $match: filter }];

        if(options.skip !== undefined){
            aggregationPipeline.push({
                $skip: options.skip
            })
        }
        if (options.limit !== undefined) {
            aggregationPipeline.push({ $limit: options.limit });
        }

        for (const fieldName of populatedFields){
            const relationship = this.relationships[fieldName as string];
            if(relationship){
            
                const relatedModel = relationship.relatedModel;
            const foreignKey = relationship.foreignKey;


            aggregationPipeline.push({
                $lookup: {
                    from: relatedModel.collection.collectionName,
                    localField: relationship.type === RelationshipType.OneToOne ? foreignKey : "_id", // Use foreignKey for OneToOne, _id for OneToMany
                    foreignField: relationship.type === RelationshipType.OneToOne ? "_id" : foreignKey, // Use _id for OneToOne, foreignKey for OneToMany
                    as: fieldName as string,
                },
            });
            
           // Handle OneToOne relationship
           if (relationship.type === RelationshipType.OneToOne) {
            aggregationPipeline.push({
                $unwind: {
                    path: `$${fieldName as string}`,
                    preserveNullAndEmptyArrays: true, // Ensure the field is null if no match is found
                },
            });
        }

           // Handle OneToMany relationship
           if (relationship.type === RelationshipType.OneToMany) {
            aggregationPipeline.push({
                $addFields: {
                    [fieldName as string]: { $ifNull: [`$${fieldName as string}`, []] }, // Ensure the field is an array (even if empty)
                },
            });
        }
            }
        }
        
        
        const documents = await this.collection.aggregate<T>(aggregationPipeline).toArray();
        for (const document of documents) {
            for (const fieldName of populatedFields) {
                if (document[fieldName] === undefined) {
                    (document[fieldName] as T[K] | null) = null; // Set the field to null if it is undefined
                }
            }
        }
        return documents;
    }

    /**
     * Finds a document by its ID and populates it with related documents if specified.
     * @param id The ID of the document to find.
     * @param populatedFields The fields to populate with related documents.
     * @returns The found document or null if it doesn't exist.
     */
    async findById<K extends keyof T>(
        id: ObjectId,
        populatedFields: K[] = []
    ): Promise<T | null> {
        const document = await this.find({_id: id} as Filter<T>, {}, populatedFields);
        return document[0] || null;
    }

    /**
     * Updates a document by its ID.
     * @param id The ID of the document to update.
     * @param data The data to update the document with.
     * @param options Optional options to pass to the update method.
     * @returns The result of the update operation.
     */
    async updateById(id: ObjectId, data: Partial<T>, options?: {session?: ClientSession}): Promise<UpdateResult<T>>{
        return await this.collection.updateOne({_id: id} as Filter<T>, {$set: data}, {session: options?.session});
    }

    


/**
 * Deletes a document from the collection by its ID.
 * @param id The ID of the document to delete.
 * @param options Optional settings for the delete operation, including a session for transaction support.
 * @returns A promise that resolves to the result of the delete operation.
 */

    async deleteById(id: ObjectId, options?: {session? : ClientSession}) : Promise<DeleteResult>{
        return await this.collection.deleteOne({
            _id: id
        } as Filter<T>, {session: options?.session})
    }

/**
     * Adds a relationship to the model.
     * @param fieldName The name of the field representing the relationship.
     * @param relationshipMetadata The metadata describing the relationship.
     * @returns The model instance.
     */
    addRelationship<R extends Document>(
        fieldName: keyof T & string,
        relationshipMetadata: RelationshipMetadata<T, R>,
    ): this{
        this.relationships[fieldName] = relationshipMetadata;
        return this
    }

    transformDocument(document:T):T{
        const transformedDocument: any = { ...document };
        for (const [fieldName, field] of Object.entries(this.fields)){
            const fieldOptions = field.getOptions();
            const value = document[fieldName];

            if(fieldOptions.transform){
                transformedDocument[fieldName] = fieldOptions.transform(value)
            }
        }
        return transformedDocument;
    }

    /**
     * Updates multiple documents in the collection that match the given filter.
     * @param filter The filter to match documents against.
     * @param update The update to apply to the matched documents.
     * @returns The number of documents that were modified.
     * @throws {MongridError} If any of the fields in the update have the `immutable` option set to `true` and the field value is not undefined.
     */
    async update(filter: Filter<T>,
        update: UpdateFilter<T>
    ): Promise<number>{
        const documents = await this.find(filter);

        for(const document of documents){
            for(const [fieldName, field] of Object.entries(this.fields)){
                const fieldOptions = field.getOptions();
                if (
                    (typeof fieldOptions.immutable === "function" ? fieldOptions.immutable(document) : fieldOptions.immutable) &&
                    update.$set &&
                    update.$set[fieldName as keyof T] !== undefined
                ) {
                    throw new MongridError(
                        `Field '${fieldName}' is immutable and cannot be modified.`,
                        ERROR_CODES.IMMUTABLE_FIELD_ERROR,
                        { fieldName, documentId: (document as any)._id }
                    );
                }
            }
        }
        const result = await this.collection.updateMany(filter, update);
        return result.modifiedCount
    }
    /**
     * Saves a document to the collection.
     * @param data The document to save.
     * @param options Optional options.
     * @returns The ObjectId of the saved document.
     * @throws {Error} If any of the required fields are not present.
     * @throws {MongridError} If the document fails validation, or if any of the fields have the `immutable` option set to `true` and the field value is not undefined.
     */
    async save(data: OptionalUnlessRequiredId<T>, options?: {session?: ClientSession}): Promise<ObjectId> {
        await this.ensureCollection();
        await this.validateDocument(data);
    
        // Check for required fields
        for (const [fieldName, field] of Object.entries(this.fields)) {
            const fieldOptions = field.getOptions();
            if (fieldOptions.required && data[fieldName] === undefined) {
                throw new MongridError(
                    `Missing required field: ${fieldName}`,
                    ERROR_CODES.VALIDATION_ERROR,
                    { fieldName }
                );
            }
        }

        // Validate relationships
    for (const [fieldName, relationship] of Object.entries(this.relationships)) {
        const foreignKeyValue = data[fieldName];
        if (foreignKeyValue) {
            const relatedModel = relationship.relatedModel;
            const relatedDocument = await relatedModel.findById(foreignKeyValue);
            if (!relatedDocument) {
                throw new MongridError(
                    `Foreign key violation: ${fieldName} references a non-existent document.`,
                    ERROR_CODES.FOREIGN_KEY_VIOLATION,
                    { fieldName, foreignKeyValue }
                );
            }
        }
    }

         // Apply default values
    // Apply default values
    for (const [fieldName, field] of Object.entries(this.fields)) {
        const fieldOptions = field.getOptions();
        if (fieldOptions.default !== undefined && data[fieldName] === undefined) {
            data[fieldName] = typeof fieldOptions.default === "function"
                ? fieldOptions.default()
                : fieldOptions.default;
        }

        // Handle nested fields
        if (field instanceof NestedField) {
            if (data[fieldName] === undefined) {
                data[fieldName] = {};
            }
            for (const [nestedFieldName, nestedField] of Object.entries(field.getFields())) {
                const nestedFieldOptions = nestedField.getOptions();
                if (nestedFieldOptions.default !== undefined && data[fieldName][nestedFieldName] === undefined) {
                    data[fieldName][nestedFieldName] = nestedFieldOptions.default;
                }
            }
        }
    }
        
       // Apply transformations
    for (const [fieldName, field] of Object.entries(this.fields)) {
        const fieldOptions = field.getOptions();
        if (fieldOptions.transform && data[fieldName] !== undefined) {
            data[fieldName] = fieldOptions.transform(data[fieldName]);
        }
    }
        

        
    const aliasedData: any = {};
    for (const [fieldName, field] of Object.entries(this.fields)) {
        const fieldOptions = field.getOptions();
        const alias = fieldOptions.alias || fieldName;
        aliasedData[alias] = data[fieldName];

        if (field instanceof NestedField) {
            aliasedData[alias] = {};
            for (const [nestedFieldName, nestedField] of Object.entries(field.getFields())) {
                const nestedFieldOptions = nestedField.getOptions();
                const nestedAlias = nestedFieldOptions.alias || nestedFieldName;
                aliasedData[alias][nestedAlias] = data[fieldName][nestedFieldName];
            }
        }
    }
        // Ensure schema validation and indexes
    await this.ensureSchemaValidation();
    await this.ensureIndexes();
        // Execute pre-save hooks
    await this.executeHooks(HookType.PreSave, aliasedData);

         // Save the document
         let _id: ObjectId;
         if (aliasedData._id) {
             // Update existing document
             const result = await this.collection.updateOne(
                 { _id: aliasedData._id },
                 { $set: aliasedData },
                 { session: options?.session }
             );
             if (result.matchedCount === 0) {
                 throw new MongridError(
                     "Document not found",
                     ERROR_CODES.DOCUMENT_NOT_FOUND,
                     { _id: aliasedData._id }
                 );
             }
             _id = aliasedData._id;
         } else {
             // Insert new document
             const result = await this.collection.insertOne(aliasedData, { session: options?.session });
             _id = result.insertedId;
         }
     
         // Execute post-save hooks
         await this.executeHooks(HookType.PostSave, aliasedData);
     
         return _id;
    }

    /**
     * Delete documents matching the filter.
     * @param filter The MongoDB filter.
     * @returns The number of documents deleted.
     */
    async delete(filter: Filter<T> = {}): Promise<number> {
        const result = await this.collection.deleteMany(filter);
        return result.deletedCount;
    }

    /**
     * Returns the BSON type of the given JavaScript type.
     * @param type The JavaScript type to convert to a BSON type.
     * @returns The BSON type of the given JavaScript type.
     */
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
