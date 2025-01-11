
import { Field } from "../fields/Field";
import { Model } from "../model";
import { RelationshipType } from "./RelationshipType";


export class RelationshipField<T> extends Field<T> {
    private relatedModel: Model<any>;
    private relationshipType: RelationshipType;

    constructor(name: string, relatedModel: Model<any>, relationshipType: RelationshipType) {
        super(name);
        this.relatedModel = relatedModel;
        this.relationshipType = relationshipType;
    }

    getRelatedModel(): Model<any> {
        return this.relatedModel;
    }

    getRelationshipType(): RelationshipType {
        return this.relationshipType;
    }
}