import { Document, IndexDescription } from "mongodb";
import { Field } from "./fields/Field";
import { Hook } from "./hooks/Hook";
import { HookType } from "./hooks/HookType";
import { Database } from "./Database";
import { Validator } from "./validators/Validator";
import { Model } from "./model";
import { RelationshipMetadata, RelationshipType } from "./relationships/RelationshipType";


export class ModelBuilder<T extends Document>{
   
    private hooks: {[key in HookType]?: Hook<T>[]} = {};
    private validators: Validator<T>[] = [];
    private indexes: IndexDescription[] = [];
    private relationships: {[key: string]: RelationshipMetadata<T, any>} = {};
    // private fields: {[key:string]: Field<any>} = {};
    private extensions: any[] = [];

    private fields: {[key:string]: Field<any>} = {};

    constructor(private db: Database,
        private collectionName: string
    ){}

    /**
     * Add a OneToOne relationship to the model.
     * @param fieldName The name of the field.
     * @param relatedModel The related model.
     * @param foreignKey The foreign key field.
     * @param cascade Whether to cascade delete.
     */
    addOneToOne<R extends Document>(
        fieldName: keyof T & string,
        relatedModel: Model<R>,
        foreignKey: string,
        cascade: boolean = false
    ): this{
        this.relationships[fieldName]
        = new RelationshipMetadata(
            RelationshipType.OneToOne,
            relatedModel,
            foreignKey,
            cascade
        );
        return this;
    }

    addField(name:string, field: Field<any>):this{
        this.fields[name] = field
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

    addNestedField(name: string, nestedField: Field<any>): this {
        this.fields[name] = nestedField;
        return this;
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

    build(): Model<T>{
        const model = new Model<T>(this.db, this.collectionName);
        
        for(const [name, field] of Object.entries(this.fields)){
            model.addField(name, field);
        }
        
        for(const [type, hooks] of Object.entries(this.hooks)){
            for(const hook of hooks){
                model.addHook(type as HookType, hook);
            }
        }
        for (const validator of this.validators){
            model.addValidator(validator);
        }

        model.ensureIndexes()
       .catch((err)=>{
            console.log({err})
        })

        return model;
    }
}