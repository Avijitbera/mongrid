import { Document } from "mongodb";
import { Model } from "../model";

export enum RelationshipType {
    OneToOne = 'OneToOne',
    OneToMany = 'OneToMany',
    ManyToMany = 'ManyToMany',
}

export class RelationshipMetadata<T extends Document, R extends Document>{
    constructor(
        public type: RelationshipType,
        public relatedModel: Model<R>,
        public foreignKey: string,
        public casecade: boolean = false,
        public bidirectional: boolean = false,
        public inverseField?: string
    ){}
}