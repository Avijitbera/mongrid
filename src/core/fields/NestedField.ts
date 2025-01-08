import { Field } from "./Field";


export class NestedField<T> extends Field<T> {
    private fields: {[key:string]: Field<any>} = {};

    constructor(name:string){
        super(name);
    }

    addField(name:string, field: Field<any>):this{
        this.fields[name] = field
        return this;
    }

    getFields(){
        return this.fields
    }
}