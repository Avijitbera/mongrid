import { Document } from "mongodb";
import { Model } from "../model";

export interface Plugin<T extends Document> {
    install(model: Model<T>): void;
}
