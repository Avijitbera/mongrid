import { Filter, Document, FindOptions, ObjectId, WithId, ClientSession, Sort, ExplainVerbosityLike } from "mongodb";
import { Model } from "./model";
import { equal, notEqual } from "assert";
import { ERROR_CODES, MongridError } from "../error/MongridError";
import { Plugin } from "./plugin/plugin";
import { AddFieldsStage, AggregationStage, BucketStage, FacetStage, GraphLookupStage, GroupStage, MergeStage, ProjectStage, RedactStage, ReplaceRootStage } from "./aggregation/AggregationStage";
import { AggregationBuilder } from "./aggregation/AggregationBuilder";


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
    private sort: Sort = {};
    private projection: { [key: string]: 1 | 0 } = {};
    
    private page: number = 1; // Pagination page number
    private pageSize: number = 10; // Pagination page size
    private plugins: Plugin<T>[] = [];

    
    constructor(private model: Model<T>){}


    /**
     * Adds a plugin to the query builder.
     * @param plugin The plugin to add.
     * @returns The query builder instance for method chaining.
     */
    use(plugin: Plugin<T>): this {
        this.plugins.push(plugin);
        if (plugin.installQueryBuilder) {
            plugin.installQueryBuilder(this);
        }
        return this;
    }

    


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
        value: T[K] | T[K][] | boolean,
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
            // Handle the `exists` operator separately
            if (operator === 'exists') {
                (this.filter[field as keyof Filter<T>] as QueryOperators<T[K]>)[mongoOperator] = value as boolean as any;
            } else {
                // Handle other operators
                let refinedValue: any;
                if (operator === 'in' || operator === 'notIn') {
                    refinedValue = value as T[K][]; // Ensure value is an array for $in and $nin
                } else if (operator === 'regex') {
                    refinedValue = value as RegExp;
                } else if (operator === 'text') {
                    refinedValue = { $search: value as string };
                } else {
                    refinedValue = value as T[K]; // Ensure value is a single value for other operators
                }

                // Safely assign the operator and value
                (this.filter[field as keyof Filter<T>] as QueryOperators<T[K]>)[mongoOperator] = refinedValue;
            }
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

    sortBy(sort:Sort):this {
        this.sort = sort;
        return this;
    }

    select(projection: {[key: string]: 1 | 0}):this {
        this.projection = projection;
        return this
    }


    

    // aggregate(stage:any):this {
    //     this.aggregationPipeline.push(stage);
    //     return this;
    // }


    /**
     * Returns an instance of AggregationBuilder for building aggregation pipelines.
     * @returns An instance of AggregationBuilder.
     */
    aggregate(): AggregationBuilder<T> {
        return new AggregationBuilder<T>(this.model);
    }




    paginate(page:number, pageSize:number):this{
        const skip = (page - 1) * pageSize; // Calculate the number of documents to skip
        this.options.skip = skip; // Apply skip
        this.options.limit = pageSize; // Apply limit
    
        
        return this;
    }

    async count():Promise<number>{
        try {
            return this.model.getCollection().countDocuments(this.filter, { session: this.session! });
        } catch (error: any) {
            throw new MongridError(
                `Count failed: ${error.message}`,
                ERROR_CODES.COUNT_ERROR,
                { filter: this.filter }
            );
        }
    }

   



    /**
     * Explains the query execution plan.
     * @param verbosity The verbosity level for the explanation.
     * @returns A promise that resolves to the query execution plan.
     * @throws {MongridError} If the explain operation fails.
     */
    async explain(verbosity: ExplainVerbosityLike = "queryPlanner"): Promise<any> {
        try {
            return this.model.getCollection().find(this.filter, { ...this.options, session: this.session! }).explain(verbosity);
        } catch (error: any) {
            throw new MongridError(
                `Explain failed: ${error.message}`,
                ERROR_CODES.EXPLAIN_ERROR,
                { filter: this.filter, options: this.options }
            );
        }
    }

    async execute(): Promise<T[]> {
        try {
            
            return this.model.find(this.filter,
                { ...this.options, sort: this.sort, projection: this.projection, session: this.session! }, this.populatedFields);
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