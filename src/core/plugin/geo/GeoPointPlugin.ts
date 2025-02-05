import { Document } from "mongodb";
import { Plugin } from "../plugin";
import { Model } from "../../model";
import { Field } from "../../fields/Field";
import { GeoPoint, GeoPointType } from "./GeoPointType";


/**
 * Represents a geospatial point with longitude and latitude.
 */


export class GeoPointPlugin<T extends Document> implements Plugin<T> {
    private geoPointType = new GeoPointType();

    install(model: Model<T>): void {

    }

    private validateGeoPoint(document:T): void{
        for(const [key, value] of Object.entries(document)){
            
        }
    }

    private isGeoPoint(value:any): value is GeoPoint {
        return value &&  typeof value === 'object' && "type" in value && "coordinates" in value;
    }


}
