import { Collection, Filter, FindOptions } from 'mongodb';
import {RelationType} from '../types/model'


export interface IModelOperations {
    getCollection(): Collection;
    client:{
        getModel(name:string): IModelOperations;
    };
    findOne(filter: Filter<any>, options?: FindOptions): Promise<any>;
    find(filter: Filter<any>, options?: FindOptions): Promise<any[]>;

    
}

export interface RelationConfig {
    type: RelationType;
    ref: string;
    foreignField?:string;
    through?:string;
    localField?:string
}

export interface Relation{
    localField: string;
    foreignField: string;
    refModel: string;
    type: RelationType
    through?: string
}
