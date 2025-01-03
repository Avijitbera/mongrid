import { Filter, ReturnDocument, FindOneAndUpdateOptions, UpdateFilter } from 'mongodb';

import { ModelDocument, ModelQueryOptions, BsonifyQueryOptions } from '../../types/model';

import { convertFilterIds } from '../../utils/id';
import { SchemaType } from '../../types/types';
import { BaseOperations } from './base_operations';


export class WriteOperations<T extends SchemaType> extends BaseOperations<T> {
  async create(data: Partial<T>): Promise<ModelDocument<T>> {
    return this.executeQuery('create', async () => {
      const validatedData = await this.hooks.executePreHooks('create', data);
      await this.validation.validate(validatedData);

      const timestamp = new Date();
      const doc = {
        ...validatedData,
        ...(this.options.timestamps && {
          createdAt: timestamp,
          updatedAt: timestamp,
        }),
      };

      const result = await this.collection.insertOne(doc);
      const created = { ...doc, _id: result.insertedId } as ModelDocument<T>;
      return this.hooks.executePostHooks('create', created);
    });
  }

  async updateOne(
    filter: Filter<ModelDocument<T>>,
    update: Partial<T>,
    options?: ModelQueryOptions
  ): Promise<ModelDocument<T> | null> {
    return this.executeQuery('updateOne', async () => {
      const query = this.queryBuilder.buildQuery(convertFilterIds(filter));
      const validatedUpdate = await this.hooks.executePreHooks('update', update);
      
      const updateDoc = {
        ...validatedUpdate,
        ...(this.options.timestamps && {
          updatedAt: new Date(),
        }),
      };

      // Extract our custom options
      const { populate, lean, ...mongoOptions } = options || {};

      const result = await this.collection.findOneAndUpdate(
        query,
        { $set: updateDoc } as UpdateFilter<ModelDocument<T>>,
        {
          ...mongoOptions,
          returnDocument: ReturnDocument.AFTER
        } as FindOneAndUpdateOptions
      );

      if (!result?.value) return null;
      
      const updated = await this.hooks.executePostHooks('update', result.value as ModelDocument<T>);
      return this.handlePopulation(updated, options);
    }, filter, options);
  }

  protected async executeQuery<R>(
    operation: string,
    callback: () => Promise<R>,
    filter?: Filter<ModelDocument<T>>,
    options?: ModelQueryOptions
  ): Promise<R> {
    try {
      return await callback();
    } catch (error) {
      throw new WriteError(operation, filter, options, error);
    }
  }
}