import { Document, Filter } from "mongodb";
import { AddFieldsStage, AggregationStage, BucketStage, CountStage, FacetStage, GraphLookupStage, GroupStage, LimitStage, LookupStage, MatchStage, MergeStage, ProjectStage, RedactStage, ReplaceRootStage, SkipStage, SortStage, UnwindStage } from "./AggregationStage";
import { Model } from "../model";
import { ERROR_CODES, MongridError } from "../../error/MongridError";

export class AggregationBuilder<T extends Document>{
    private aggregationPipeline: AggregationStage<T>[] = [];

    constructor(private model: Model<T>) {}

    /**
     * Adds a $match stage to the aggregation pipeline.
     * @param filter The filter to apply.
     * @returns The AggregationBuilder instance for chaining.
     */
    match(filter: Filter<T>): this {
        const matchStage: MatchStage<T> = { $match: filter };
        this.aggregationPipeline.push(matchStage);
        return this;
    }

    /**
     * Adds a $group stage to the aggregation pipeline.
     * @param group The grouping criteria.
     * @returns The AggregationBuilder instance for chaining.
     */
    group(group: { _id: any; [key: string]: any }): this {
        const groupStage: GroupStage<T> = { $group: group };
        this.aggregationPipeline.push(groupStage);
        return this;
    }

    /**
     * Adds a $sort stage to the aggregation pipeline.
     * @param sort The sorting criteria.
     * @returns The AggregationBuilder instance for chaining.
     */
    sort(sort: SortStage<T>['$sort']): this {
        const sortStage: SortStage<T> = { $sort: sort };
        this.aggregationPipeline.push(sortStage);
        return this;
    }

    /**
     * Adds a $lookup stage to the aggregation pipeline.
     * @param lookup The join configuration.
     * @returns The AggregationBuilder instance for chaining.
     */
    lookup(lookup: LookupStage<T>['$lookup']): this {
        const lookupStage: LookupStage<T> = { $lookup: lookup };
        this.aggregationPipeline.push(lookupStage);
        return this;
    }

    /**
     * Adds a $count stage to the aggregation pipeline.
     * @param fieldName The name of the field to store the count.
     * @returns The AggregationBuilder instance for chaining.
     */
    count(fieldName: string): this {
        const countStage: CountStage<T> = { $count: fieldName };
        this.aggregationPipeline.push(countStage);
        return this;
    }

    /**
     * Adds a $limit stage to the aggregation pipeline.
     * @param limit The maximum number of documents to pass to the next stage.
     * @returns The AggregationBuilder instance for chaining.
     */
    limit(limit: number): this {
        const limitStage: LimitStage<T> = { $limit: limit };
        this.aggregationPipeline.push(limitStage);
        return this;
    }


    /**
     * Adds a $skip stage to the aggregation pipeline.
     * @param skip The number of documents to skip.
     * @returns The AggregationBuilder instance for chaining.
     */
    skip(skip: number): this {
        const skipStage: SkipStage<T> = { $skip: skip };
        this.aggregationPipeline.push(skipStage);
        return this;
    }


    /**
     * Adds a $project stage to the aggregation pipeline.
     * @param project The projection criteria.
     * @returns The AggregationBuilder instance for chaining.
     */
    project(project: ProjectStage<T>['$project']): this {
        const projectStage: ProjectStage<T> = { $project: project };
        this.aggregationPipeline.push(projectStage);
        return this;
    }

    /**
     * Adds a $unwind stage to the aggregation pipeline.
     * @param path The field path to unwind.
     * @returns The AggregationBuilder instance for chaining.
     */
    unwind(path: string): this {
        const unwindStage: UnwindStage<T> = { $unwind: path };
        this.aggregationPipeline.push(unwindStage);
        return this;
    }

    /**
     * Adds a $addFields stage to the aggregation pipeline.
     * @param fields The fields to add.
     * @returns The AggregationBuilder instance for chaining.
     */
    addFields(fields: AddFieldsStage<T>['$addFields']): this {
        const addFieldsStage: AddFieldsStage<T> = { $addFields: fields };
        this.aggregationPipeline.push(addFieldsStage);
        return this;
    }

    /**
     * Adds a $replaceRoot stage to the aggregation pipeline.
     * @param newRoot The new root document.
     * @returns The AggregationBuilder instance for chaining.
     */
    replaceRoot(newRoot: ReplaceRootStage<T>['$replaceRoot']['newRoot']): this {
        const replaceRootStage: ReplaceRootStage<T> = { $replaceRoot: { newRoot } };
        this.aggregationPipeline.push(replaceRootStage);
        return this;
    }

    /**
     * Adds a $facet stage to the aggregation pipeline.
     * @param facets The facets to create.
     * @returns The AggregationBuilder instance for chaining.
     */
    facet(facets: FacetStage<T>['$facet']): this {
        const facetStage: FacetStage<T> = { $facet: facets };
        this.aggregationPipeline.push(facetStage);
        return this;
    }

    /**
     * Adds a $bucket stage to the aggregation pipeline.
     * @param bucket The bucket configuration.
     * @returns The AggregationBuilder instance for chaining.
     */
    bucket(bucket: BucketStage<T>['$bucket']): this {
        const bucketStage: BucketStage<T> = { $bucket: bucket };
        this.aggregationPipeline.push(bucketStage);
        return this;
    }


    /**
     * Adds a $graphLookup stage to the aggregation pipeline.
     * @param graphLookup The graph lookup configuration.
     * @returns The AggregationBuilder instance for chaining.
     */
    graphLookup(graphLookup: GraphLookupStage<T>['$graphLookup']): this {
        const graphLookupStage: GraphLookupStage<T> = { $graphLookup: graphLookup };
        this.aggregationPipeline.push(graphLookupStage);
        return this;
    }



    /**
     * Adds a $merge stage to the aggregation pipeline.
     * @param merge The merge configuration.
     * @returns The AggregationBuilder instance for chaining.
     */
    merge(merge: MergeStage<T>['$merge']): this {
        const mergeStage: MergeStage<T> = { $merge: merge };
        this.aggregationPipeline.push(mergeStage);
        return this;
    }

    /**
     * Adds a $redact stage to the aggregation pipeline.
     * @param redact The redact configuration.
     * @returns The AggregationBuilder instance for chaining.
     */
    redact(redact: RedactStage<T>['$redact']): this {
        const redactStage: RedactStage<T> = { $redact: redact };
        this.aggregationPipeline.push(redactStage);
        return this;
    }
    

     /**
     * Executes the aggregation pipeline.
     * @returns A promise that resolves to the aggregation results.
     * @throws {MongridError} If the aggregation fails.
     */
     async execute(): Promise<T[]> {
        try {
            if (this.aggregationPipeline.length === 0) {
                throw new MongridError(
                    "Aggregation pipeline is empty",
                    ERROR_CODES.AGGREGATION_ERROR,
                    { pipeline: this.aggregationPipeline }
                );
            }
            return this.model.getCollection().aggregate<T>(this.aggregationPipeline).toArray();
        } catch (error: any) {
            throw new MongridError(
                `Aggregation failed: ${error.message}`,
                ERROR_CODES.AGGREGATION_ERROR,
                { pipeline: this.aggregationPipeline, errorDetails: error }
            );
        }
    }
}
