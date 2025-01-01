import { IModelOperations, Relation, RelationConfig } from "./types";
import {Model} from '../model/model'
import { ModelDocument } from "../types/model";
export class RelationManager {
    private relations: Map<string, Relation> = new Map()
    constructor(private model: IModelOperations){}

    addRelation(field: string, config: RelationConfig): void {
        this.relations.set(field, {
          localField: config.localField || '_id',
          foreignField: config.foreignField || `${field}Id`,
          refModel: config.ref,
          type: config.type,
          through: config.through
        });
      }

      async populate<T extends ModelDocument<any>>(doc: T, fields: string[]): Promise<T> {
        const populated = { ...doc } as T;
    
        for (const field of fields) {
          const relation = this.relations.get(field);
          if (!relation) continue;
    
          populated[field as keyof T] = await this.resolveRelation(doc, relation);
        }
    
        return populated;
      }

      getRequiredFields(populate: string[]): Record<string, 1> {
        const fields: Record<string, 1> = { _id: 1 };
        
        for (const field of populate) {
          const relation = this.relations.get(field);
          if (relation) {
            fields[relation.localField] = 1;
          }
        }
    
        return fields;
      }

      private async resolveRelation(doc: any, relation: Relation): Promise<any> {
        const { type, refModel, localField, foreignField, through } = relation;
    
        switch (type) {
          case 'ONE_TO_ONE':
            return this.resolveOneToOne(doc, refModel, localField, foreignField);
          case 'ONE_TO_MANY':
            return this.resolveOneToMany(doc, refModel, localField, foreignField);
          case 'MANY_TO_MANY':
            return this.resolveManyToMany(doc, refModel, localField, through!);
          case 'MANY_TO_ONE':
            return this.resolveManyToOne(doc, refModel, localField, foreignField);
          default:
            throw new Error(`Unsupported relation type: ${type}`);
        }
      }

      private async resolveOneToOne(
        doc: any,
        refModel: string,
        localField: string,
        foreignField: string
      ): Promise<any> {
        const localValue = doc[localField];
        if (!localValue) return null;
    
        const query = { [foreignField]: localValue };
        return this.model.client.getModel(refModel).findOne(query);
      }

      private async resolveOneToMany(
        doc: any,
        refModel: string,
        localField: string,
        foreignField: string
      ): Promise<any[]> {
        const localValue = doc[localField];
        if (!localValue) return [];
    
        const query = { [foreignField]: localValue };
        return this.model.client.getModel(refModel).find(query);
      }

      private async resolveManyToMany<T extends ModelDocument<any>>(
        doc: T,
        refModel: string,
        localField: string,
        through: string
      ): Promise<any[]> {
        const junctionModel = this.model.client.getModel(through);
        const targetModel = this.model.client.getModel(refModel);
    
        const relations = await junctionModel.find({
          [localField]: doc._id
        });
    
        const targetIds = relations.map(rel => rel[refModel.toLowerCase() + 'Id']);
    
        return targetModel.find({
          _id: { $in: targetIds }
        });
      }
}
