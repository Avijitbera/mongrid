import { Filter, Document, FindOptions, ObjectId, WithId, ClientSession, Sort, ExplainVerbosityLike } from "mongodb";
import { Model } from "./model";
import { equal, notEqual } from "assert";
import { ERROR_CODES, MongridError } from "../error/MongridError";
import { Plugin } from "./plugin/plugin";
import { AddFieldsStage, AggregationStage, BucketStage, FacetStage, GraphLookupStage, GroupStage, MergeStage, ProjectStage, RedactStage, ReplaceRootStage } from "./types/AggregationStage";


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
    private aggregationPipeline: AggregationStage<T>[] = [];
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

    /**
     * Validates the aggregation pipeline before execution.
     * @throws {MongridError} If the pipeline is empty or invalid.
     */
    private validatePipeline(): void {
        if (this.aggregationPipeline.length === 0) {
            throw new MongridError(
                "Aggregation pipeline is empty",
                ERROR_CODES.AGGREGATION_ERROR,
                { pipeline: this.aggregationPipeline }
            );
        }
    }

    

    // aggregate(stage:any):this {
    //     this.aggregationPipeline.push(stage);
    //     return this;
    // }

    async aggregate(): Promise<any[]> {
        try {
            this.validatePipeline();
            return this.model.getCollection().aggregate(this.aggregationPipeline).toArray();
        } catch (error: any) {
            throw new MongridError(
                `Aggregation failed: ${error.message}`,
                ERROR_CODES.AGGREGATION_ERROR,
                { pipeline: this.aggregationPipeline }
            );
        }
    }

    /**
     * Adds a $count stage to the aggregation pipeline.
     * @param fieldName The name of the field to store the count.
     * @returns The QueryBuilder instance for chaining.
     * @example
     * queryBuilder.countAgg("totalOrders");
     */
    countAgg(fieldName: string): this {
        this.aggregationPipeline.push({ $count: fieldName });
        return this;
    }

    /**
     * Adds a $limit stage to the aggregation pipeline.
     * @param limit The maximum number of documents to pass to the next stage.
     * @returns The QueryBuilder instance for chaining.
     * @example
     * queryBuilder.limitAgg(10);
     */
    limitAgg(limit: number): this {
        this.aggregationPipeline.push({ $limit: limit });
        return this;
    }

    /**
     * Adds a $skip stage to the aggregation pipeline.
     * @param skip The number of documents to skip.
     * @returns The QueryBuilder instance for chaining.
     * @example
     * queryBuilder.skipAgg(5);
     */
    skipAgg(skip: number): this {
        this.aggregationPipeline.push({ $skip: skip });
        return this;
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
     * Adds a $lookup stage to the aggregation pipeline.
     * @param from The collection to join.
     * @param localField The field from the input documents.
     * @param foreignField The field from the documents of the "from" collection.
     * @param as The name of the new array field.
     * @returns The QueryBuilder instance for chaining.
     */
     lookup(from: string, localField: string, foreignField: string, as: string): this {
        this.aggregationPipeline.push({
            $lookup: {
                from,
                localField,
                foreignField,
                as,
            },
        });
        return this;
    }

     /**
     * Adds a $unwind stage to the aggregation pipeline.
     * @param path The field path to unwind.
     * @returns The QueryBuilder instance for chaining.
     */
     unwind(path: string): this {
        this.aggregationPipeline.push({ $unwind: `$${path}` });
        return this;
    }

    /**
     * Adds a $addFields stage to the aggregation pipeline.
     * @param fields The fields to add.
     * @returns The QueryBuilder instance for chaining.
     */
    addFields(fields: AddFieldsStage<T>["$addFields"]): this {
        this.aggregationPipeline.push({ $addFields: fields });
        return this;
    }

    /**
     * Adds a $redact stage to the aggregation pipeline.
     * @param redact The redact configuration.
     * @returns The QueryBuilder instance for chaining.
     */
    redact(redact: RedactStage<T>["$redact"]): this {
        this.aggregationPipeline.push({ $redact: redact });
        return this;
    }

    /**
     * Adds a $merge stage to the aggregation pipeline.
     * @param merge The merge configuration.
     * @returns The QueryBuilder instance for chaining.
     */
    merge(merge: MergeStage<T>["$merge"]): this {
        this.aggregationPipeline.push({ $merge: merge });
        return this;
    }

    /**
     * Adds a $graphLookup stage to the aggregation pipeline.
     * @param graphLookup The graph lookup configuration.
     * @returns The QueryBuilder instance for chaining.
     */
    graphLookup(graphLookup: GraphLookupStage<T>["$graphLookup"]): this {
        this.aggregationPipeline.push({ $graphLookup: graphLookup });
        return this;
    }

    /**
     * Adds a $replaceRoot stage to the aggregation pipeline.
     * @param newRoot The new root document.
     * @returns The QueryBuilder instance for chaining.
     */
    replaceRoot(newRoot: ReplaceRootStage<T>["$replaceRoot"]["newRoot"]): this {
        this.aggregationPipeline.push({ $replaceRoot: { newRoot } });
        return this;
    }

    /**
     * Adds a $bucket stage to the aggregation pipeline.
     * @param bucket The bucket configuration.
     * @returns The QueryBuilder instance for chaining.
     */
    bucket(bucket: BucketStage<T>["$bucket"]): this {
        this.aggregationPipeline.push({ $bucket: bucket });
        return this;
    }

    /**
     * Adds a $facet stage to the aggregation pipeline.
     * @param facets The facets to create.
     * @returns The QueryBuilder instance for chaining.
     */
    facet(facets: FacetStage<T>["$facet"]): this {
        this.aggregationPipeline.push({ $facet: facets });
        return this;
    }

    /**
     * Adds a $project stage to the aggregation pipeline.
     * @param project The projection criteria.
     * @returns The QueryBuilder instance for chaining.
     */
    project(project: ProjectStage<T>["$project"]): this {
        this.aggregationPipeline.push({ $project: project });
        return this;
    }

    /**
     * Adds a $group stage to the aggregation pipeline.
     * @param group The grouping criteria.
     * @returns The QueryBuilder instance for chaining.
     */
    group(group: GroupStage<T>["$group"]): this {
        this.aggregationPipeline.push({ $group: group });
        return this;
    }

    /**
     * Adds a $match stage to the aggregation pipeline.
     * @param filter The filter to apply.
     * @returns The QueryBuilder instance for chaining.
     */
    match(filter: Filter<T>): this {
        this.aggregationPipeline.push({ $match: filter });
        return this;
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
            
            if (this.aggregationPipeline.length > 0) {
                // Use aggregation pipeline if stages are added
                return this.model.getCollection().aggregate<T>(this.aggregationPipeline, { session: this.session! }).toArray();
            } else {
                // Use find query with filter, options, and populated fields
                return this.model.find(this.filter,
                     { ...this.options, sort: this.sort, projection: this.projection, session: this.session! }, this.populatedFields);
            }
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