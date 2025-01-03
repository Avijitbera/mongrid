import { IModelOperations, Relation, RelationConfig } from "./types";

import { ModelDocument } from "../types/model";
export class RelationManager {
    private relations: Map<string, Relation> = new Map()
    constructor(private model: IModelOperations){}

    /**
     * Register a relation between two models.
     *
     * @param field - The field on the model where the relation will be stored.
     * @param config - The relation configuration.
     * @param config.localField - The field on the local model.
     * @param config.foreignField - The field on the related model.
     * @param config.ref - The name of the related model.
     * @param config.type - The type of the relation (ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY).
     * @param config.through - The pivot model for MANY_TO_MANY relations.
     */
    addRelation(field: string, config: RelationConfig): void {
        this.relations.set(field, {
          localField: config.localField || '_id',
          foreignField: config.foreignField || `${field}Id`,
          refModel: config.ref,
          type: config.type,
          through: config.through
        });
      }

    /**
     * Populate a document with relations.
     *
     * @param doc - The document to populate.
     * @param fields - The fields to populate.
     * @returns The populated document.
     */
      async populate<T extends ModelDocument<any>>(doc: T, fields: string[]): Promise<T> {
        const populated = { ...doc } as T;
    
        for (const field of fields) {
          const relation = this.relations.get(field);
          if (!relation) continue;
    
          populated[field as keyof T] = await this.resolveRelation(doc, relation);
        }
    
        return populated;
      }

      /**
       * Returns an object of fields required to populate the given relations.
       *
       * @param populate - The fields to populate.
       * @returns An object where the keys are the required fields and the value is always 1.
       */
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

    /**
     * Resolve a relation on the given document.
     *
     * @param doc - The document where the relation is stored.
     * @param relation - The relation configuration.
     * @returns The resolved value.
     * @throws {Error} If the relation type is unsupported.
     */
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

      private async resolveManyToOne<T extends ModelDocument<any>>(
        doc: T,
        refModel: string,
        localField: string,
        foreignField: string
      ): Promise<any> {
        const foreignValue = doc[foreignField];
        if (!foreignValue) return null;
    
        const query = { [localField]: foreignValue };
        return this.model.client.getModel(refModel).findOne(query);
      }
}
