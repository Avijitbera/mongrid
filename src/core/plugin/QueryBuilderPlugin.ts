import { Document } from "mongodb";
import { QueryBuilder } from "../QueryBuilder";


export interface QueryBuilderPlugin<T extends Document> {
    /**
     * Installs custom methods on the QueryBuilder.
     * @param queryBuilder The QueryBuilder instance.
     */
    installQueryBuilderMethods(queryBuilder: QueryBuilder<T>): void;
}