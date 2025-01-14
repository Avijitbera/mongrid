import { Filter, Document, FindOptions, ObjectId, WithId } from "mongodb";
import { Model } from "./model";
import { equal, notEqual } from "assert";


type ComparisonOperators<T> = {
    equal?: T;
    notEqual?: T;
    greaterThan?: T;
    greaterThanOrEqual?: T;
    lessThan?: T;
    lessThanOrEqual?: T;
    in?:T[],
    notIn?:T[],
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

    constructor(private model: Model<T>){}


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
}