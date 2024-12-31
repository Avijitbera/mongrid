import { Document, Filter, FindOptions, WithId } from "mongodb";
import { QueryHandlers } from "../types";


export async function handleBeforeFind<T extends Document>(
    handler: QueryHandlers['beforeFind'],
    args: unknown[]
): Promise<[Filter<T>, FindOptions?]>{
    if (!handler || args.length < 1) {
        return [args[0] as Filter<T>, args[1] as FindOptions];
      }
    
      const [filter, options] = args as [Filter<T>, FindOptions?];
      return handler<T>(filter, options);
}

export async function handleAfterFind<T extends Document>(
    handler: QueryHandlers<T>['afterFind'],
    args: unknown[]
  ): Promise<WithId<T>[]> {
    if (!handler || args.length < 1) {
      return args[0] as WithId<T>[];
    }
  
    return handler<T>(args[0] as WithId<T>[]);
  }