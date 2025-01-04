import {Filter, FindOptions, WithId} from 'mongodb'
import {BaseModel} from './base'
import {SchemaType} from '../types/types'
import {ModelDocument, ModelQueryOptions} from '../types/model'
import { convertFilterIds } from '../utils/id';

export class ModelOperations<T extends SchemaType> extends BaseModel<T> {
  

  async findOne(
    filter: Filter<ModelDocument<T>>,
    options?: ModelQueryOptions
  ): Promise<ModelDocument<T> | null> {
    const query = this.queryBuilder.buildQuery(convertFilterIds(filter));
    const queryOptions = this.queryBuilder.buildOptions(options);

    const doc = await this.collection.findOne<WithId<ModelDocument<T>>>(query, queryOptions);
    if (!doc) return null;

    const result = await this.hooks.executePostHooks('findOne', doc);

    if (options?.populate) {
      return this.relationManager.populate(result, options.populate);
    }

    return result;
  }
  
    async create(data: Partial<T>): Promise<ModelDocument<T>> {
        const validatedData = await this.hooks.executePreHooks('create', data);
        await this.validation.validate(validatedData);
        const timestamp = new Date();
        const doc = {
            ...validatedData,
            ...(this.options.timestamps && {createdAt: timestamp, updatedAt: timestamp}),
        };
        const result = await this.collection.insertOne(doc);
        const created = {...doc, _id: result.insertedId} as ModelDocument<T>;
        return await this.hooks.executePostHooks('create', created);
    }

    async find(
      filter: Filter<ModelDocument<T>>,
      options?: ModelQueryOptions
    ): Promise<ModelDocument<T>[]> {
      const query = this.queryBuilder.buildQuery(convertFilterIds(filter));
      const queryOptions = this.queryBuilder.buildOptions(options);
  
      const docs = await this.collection.find<WithId<ModelDocument<T>>>(query, queryOptions).toArray();
      const results = await this.hooks.executePostHooks('find', docs);
  
      if (options?.populate) {
        return Promise.all(results.map((doc: any) => this.relationManager.populate(doc, options.populate!)));
      }
  
      return results;
    }
}



