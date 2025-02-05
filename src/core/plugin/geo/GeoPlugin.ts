import { Document } from "mongodb";
import { Plugin } from "../plugin";
import { Model } from "../../model";
import { Field } from "../../fields/Field";


/**
 * Represents a geospatial point with longitude and latitude.
 */
export interface GeoPoint {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
}

export class GeoPlugin<T extends Document> implements Plugin<T> {
    private geoField: {[key:string]: Field<GeoPoint>} = {};
    install(model: Model<T>): void {
        for(const [fileName, field] of Object.entries(this.geoField)){
            model.addField(fileName, field);
        }
        
    }



}
