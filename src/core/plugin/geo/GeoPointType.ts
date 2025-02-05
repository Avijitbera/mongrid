import { CustomType } from "../../types/CustomType";


export interface GeoPoint {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
}

export class GeoPointType implements CustomType<GeoPoint>{
    validate(value: GeoPoint): void {
        if (!value.type || value.type !== "Point" || !Array.isArray(value.coordinates) || value.coordinates.length !== 2) {
            throw new Error("Invalid GeoPoint format");
        }
    }
    trasform(value: GeoPoint): GeoPoint {
        return {
            type: "Point",
            coordinates: value.coordinates,
        };
    }
    toMongoSchema() {
        return {
            bsonType: "object",
            required: ["type", "coordinates"],
            properties: {
                type: { bsonType: "string", enum: ["Point"] },
                coordinates: {
                    bsonType: "array",
                    items: { bsonType: "double" },
                    minItems: 2,
                    maxItems: 2,
                },
            },
        };
    }

}
