import { Relation } from "./types";
import {Model} from '../model/model'
export class RelationManager {
    private relations: Map<string, Relation> = new Map()
    constructor(private model: Model<any>){}
}
