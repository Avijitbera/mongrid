import { ObjectId } from "mongodb";

export type InsertData<T> = T & { _id?: ObjectId };