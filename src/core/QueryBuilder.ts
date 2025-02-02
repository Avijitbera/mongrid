import { Filter, Document, FindOptions, ObjectId, WithId, ClientSession } from "mongodb";
import { Model } from "./model";
import { equal, notEqual } from "assert";
import { ERROR_CODES, MongridError } from "../error/MongridError";


type ComparisonOperators<T> = {
    equal?: T;
    notEqual?: T;
    greaterThan?: T;
    greaterThanOrEqual?: T;
    lessThan?: T;
    lessThanOrEqual?: T;
    in?:T[],
    notIn?:T[],
    exists?: boolean;
    regex?: RegExp;
    text?: string;
    // near?: GeoNearOptions;
    // within?: GeoWithinOptions;
}

type LogicalOperators<T> = {
    and?: Filter<T>[];
    or?: Filter<T>[];
    not?: Filter<T>[],
    nor?: Filter<T>[]
}

type QueryOperators<T> = ComparisonOperators<T> & LogicalOperators<T>;

export class QueryBuilder<T extends Document>{
    private filter: Filter<T> = {};
    private options: FindOptions = {};
    private populatedFields: (keyof T)[] = [];
    private session: ClientSession | null = null;



    constructor(private model: Model<T>){}

/**
     * Sets the transaction session for the query.
     * @param session The MongoDB client session.
     * @returns The QueryBuilder instance for chaining.
     */
    setSession(session: ClientSession): this {
        this.session = session;
        return this;
    }


    where<K extends keyof T>(
        field: K,
        operator: keyof ComparisonOperators<T[K]>,
        value: T[K] | T[K][],
    ): this {
        if(!this.filter[field as keyof Filter<T>]){
            this.filter[field as keyof Filter<T>] = {} as QueryOperators<T[K]>;
        }
        const mongoOperatorMap: Record<keyof ComparisonOperators<T[K]>, string> = {
            equal: '$eq',
            notEqual: '$ne',
            greaterThan: '$gt',
            greaterThanOrEqual: '$gte',
            lessThan: '$lt',
            lessThanOrEqual: '$lte',
            in: '$in',
            notIn: '$nin',
            exists: '$exists',
            regex: '$regex',
            text: '$text',
            // near: '$near',
            // within: '$geoWithin',
        };

        const mongoOperator = mongoOperatorMap[operator] as keyof QueryOperators<T[K]>;
        if (mongoOperator) {
            // Refine the value based on the operator
            let refinedValue: any;
            if (operator === 'in' || operator === 'notIn') {
                refinedValue = value as T[K][]; // Ensure value is an array for $in and $nin
            } else {
                refinedValue = value as T[K]; // Ensure value is a single value for other operators
            }

            // Safely assign the operator and value
            (this.filter[field as keyof Filter<T>] as QueryOperators<T[K]>)[mongoOperator] = refinedValue;
        }

        return this;
    }

    whereId(_id: ObjectId): this {
         this.filter._id = _id as unknown as Filter<T>['_id'];
         return this
    }

    and(condition: Filter<T>[]):this{
        this.filter.$and = condition as Filter<WithId<T>>[];
        return this
    }

    or(condition: Filter<T>[]):this{
        this.filter.$or = condition as Filter<WithId<T>>[];
        return this;
    }

    not<K extends keyof T>(field: K, condition: Filter<T[K]>): this {
        // Apply the $not operator to the specified field
        this.filter[field as keyof Filter<T>] = { $not: condition } as Filter<T[K]>;
        return this;
    }

    nor(conditions: Filter<T>[]): this {
        this.filter.$nor = conditions as Filter<WithId<T>>[];
        return this;
    }

    limit(limit:number): this {
        this.options.limit = limit;
        return this;
    }

    skip(skip:number):this {
        this.options.skip = skip;
        return this
    }

    populate<K extends keyof T>(...fields: K[]):this{
        this.populatedFields.push(...fields);
        return this
    }

    async execute(): Promise<T[]> {
        try {
            
            return this.model.find(this.filter, this.options, this.populatedFields);
        } catch (error:any) {
            throw new MongridError(
                `Query execution failed: ${error.message}`,
                ERROR_CODES.QUERY_EXECUTION_ERROR,
                {filter:this.filter, options: this.options, populatedFields: this.populatedFields}
            )
        }

    }

    async executeOne(): Promise<T | null> {
        try {
            
            const results = await this.execute();
            return results[0] || null;
        } catch (error:any) {
            throw new MongridError(
                `Query execution failed: ${error.message}`,
                ERROR_CODES.QUERY_EXECUTION_ERROR,
                {filter: this.filter, options:this.options}
            )
        }
    }
}