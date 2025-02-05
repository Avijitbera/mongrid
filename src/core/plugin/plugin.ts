import { Document } from "mongodb";
import { Model } from "../model";

export interface Plugin<T extends Document> {
    /**
     * Installs the plugin on the Model.
     * @param model The Model instance.
     */
    install(model: Model<T>): void;

     /**
     * Generates MongoDB schema validation rules for the plugin.
     * @returns The MongoDB schema.
     */
     toMongoSchema?(): any;
}
