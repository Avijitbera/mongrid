import { Document, Filter } from "mongodb";
import { AggregationStage, CountStage, GroupStage, LimitStage, LookupStage, MatchStage, ProjectStage, SkipStage, SortStage, UnwindStage } from "./AggregationStage";
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
    group(group: GroupStage<T>['$group']): this {
        const groupStage: AggregationStage<T> = { $group: group };
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
