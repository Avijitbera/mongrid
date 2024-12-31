import { Document } from "mongodb";
import { QueryHandlers } from "../types";

export type HandlerResult<T> = T | [T] | [T, T];
export interface HandlerContext<T extends Document = Document> {
    handler: QueryHandlers[keyof QueryHandlers];
    args: unknown[];
    phase: keyof QueryHandlers;
}
