import { ObjectId } from "mongodb";

export function toObjectId(id: string | ObjectId): ObjectId {
    return typeof id === "string" ? new ObjectId(id) : id;
}

export function convertFilterIds<T extends Record<string, any>>(filter: T): T {
    const converted = { ...filter };
    
    if (converted._id) {
      if (typeof converted._id === 'string') {
        converted._id = toObjectId(converted._id);
      } else if (typeof converted._id === 'object') {
        // Handle $in, $eq, etc operators
        Object.entries(converted._id).forEach(([op, value]) => {
          if (Array.isArray(value)) {
            converted._id[op] = value.map(toObjectId);
          } else if (typeof value === 'string') {
            converted._id[op] = toObjectId(value);
          }
        });
      }
    }
    
    return converted;
  }