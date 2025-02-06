import { Document } from "mongodb";
import { Model } from "../model";
import { QueryBuilder } from "../QueryBuilder";

export interface Plugin<T extends Document> {
    /**
     * Installs the plugin on the Model.
     * @param model The Model instance.
     */
    installModel?(model: Model<T>): void;

    /**
     * Installs the plugin on the QueryBuilder.
     * @param queryBuilder The QueryBuilder instance.
     */
    installQueryBuilder?(queryBuilder: QueryBuilder<T>): void;

     
}
