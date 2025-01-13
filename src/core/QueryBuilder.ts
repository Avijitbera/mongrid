import { Filter } from "mongodb";


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

