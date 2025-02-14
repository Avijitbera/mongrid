import { Filter } from "mongodb";

interface MatchStage<T> {
    $match: Filter<T>
}

interface GroupStage<T> {
    $group:{
        _id:any;
        [key: string]:any;
    }
}

