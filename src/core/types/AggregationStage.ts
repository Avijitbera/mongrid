import { Filter, Sort } from "mongodb";

export interface MatchStage<T> {
    $match: Filter<T>
}

export interface GroupStage<T> {
    $group:{
        _id:any;
        [key: string]:any;
    }
}

export interface SortStage<T> {
    $sort: Sort
}

export interface ProjectStage<T> {
    $project: {
        [key: string]: 1 | 0 | any;
    }
}

export interface LookupStage<T> {
    $lookup: {
        from: string;
        localField:string;
        foreignField:string;
        as:string;
    }
}

export interface UnwindStage<T> {
    $unwind: string;
}

export interface AddFieldsStage<T> {
    $addFields: {
        [key: string]: any;
    }
}

export interface ReplaceRootStage<T> {
    $replaceRoot: {
        newRoot: string | any;
    }
}

export interface FacetStage<T> {
    $facet:{
        [key: string]: any
    }
}

export interface BucketStage<T> {
    $bucket: {
        groupBy: any;
        boundaries: any[];
        default: any;
        output: any;
    }
}

export interface GraphLookupStage<T> {
    $graphLookup: {
        from: string;
        startWith: any;
        connectFromField: string;
        connectToField: string;
        as: string;
        maxDepth?: number;
        depthField?: string;
    };
}

export interface MergeStage<T> {
    $merge: {
        into: string;
        whenMatched?: "merge" | "replace" | "keepExisting" | "fail";
        whenNotMatched?: "insert" | "discard" | "fail";
    };
}

export interface RedactStage<T> {
    $redact: any;
}

export type AggregationStage<T> =
    | MatchStage<T>
    | GroupStage<T>
    | SortStage<T>
    | ProjectStage<T>
    | LookupStage<T>
    | UnwindStage<T>
    | AddFieldsStage<T>
    | ReplaceRootStage<T>
    | FacetStage<T>
    | BucketStage<T>
    | GraphLookupStage<T>
    | MergeStage<T>
    | RedactStage<T>;

