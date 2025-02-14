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

