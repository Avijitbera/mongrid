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

