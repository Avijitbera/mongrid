import { Document } from "mongodb";
import { Model } from "../model";

export enum RelationshipType {
    OneToOne = 'OneToOne',
    OneToMany = 'OneToMany',
    ManyToMany = 'ManyToMany',
}

export class RelationshipMetadata<T extends Document, R extends Document>{
    /**
     * @param type The type of relationship.
     * @param relatedModel The model of the related documents.
     * @param foreignKey The foreign key field in the related documents.
     * @param casecade Whether to cascade delete.
     * @param bidirectional Whether it is a bidirectional relationship.
     * @param inverseField The inverse field in the related documents.
     */
    constructor(
        public type: RelationshipType,
        public relatedModel: Model<R>,
        public foreignKey: string,
        public casecade: boolean = false,
        public bidirectional: boolean = false,
        public inverseField?: string
    ){}
}