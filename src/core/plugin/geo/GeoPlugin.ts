import { Document } from "mongodb";
import { Plugin } from "../plugin";
import { Model } from "../../model";
import { Field } from "../../fields/Field";
import { GeoPoint } from "./GeoPointType";


/**
 * Represents a geospatial point with longitude and latitude.
 */


export class GeoPlugin<T extends Document> implements Plugin<T> {
    private geoField: {[key:string]: Field<GeoPoint>} = {};
    install(model: Model<T>): void {
        for(const [fileName, field] of Object.entries(this.geoField)){
            model.addField(fileName, field);
        }
        
    }



}
