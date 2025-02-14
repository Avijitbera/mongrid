import { Filter, Sort } from "mongodb";

interface MatchStage<T> {
    $match: Filter<T>
}

interface GroupStage<T> {
    $group:{
        _id:any;
        [key: string]:any;
    }
}

interface SortStage<T> {
    $sort: Sort
}

interface ProjectStage<T> {
    $project: {
        [key: string]: 1 | 0 | any;
    }
}

interface LookupStage<T> {
    $lookup: {
        from: string;
        localField:string;
        foreignField:string;
        as:string;
    }
}

interface UnwindStage<T> {
    $unwind: string;
}

interface AddFieldsStage<T> {
    $addFields: {
        [key: string]: any;
    }
}

interface ReplaceRootStage<T> {
    $replaceRoot: {
        newRoot: string | any;
    }
}

interface FacetStage<T> {
    $facet:{
        [key: string]: any
    }
}

interface BucketStage<T> {
    $bucket: {
        groupBy: any;
        boundaries: any[];
        default: any;
        output: any;
    }
}

interface GraphLookupStage<T> {
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

interface MergeStage<T> {
    $merge: {
        into: string;
        whenMatched?: "merge" | "replace" | "keepExisting" | "fail";
        whenNotMatched?: "insert" | "discard" | "fail";
    };
}

interface RedactStage<T> {
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

