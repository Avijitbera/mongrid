import { Document, Filter, FindOptions, WithId } from "mongodb";
import { QueryHandlers } from "../types";


  /**
   * Runs the beforeFind handler for the given model, if it exists.
   * 
   * @param handler The beforeFind handler to run.
   * @param args The arguments to pass to the handler. The first argument is the filter, and the second argument is the find options.
   * @returns The result of the handler, or the original arguments if the handler doesn't exist.
   */
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

  /**
   * Runs the afterFind handler for the given model, if it exists.
   * 
   * @param handler The afterFind handler to run.
   * @param args The arguments to pass to the handler.
   * @returns The result of the handler, or the original arguments if the handler doesn't exist.
   */
export async function handleAfterFind<T extends Document>(
    handler: QueryHandlers<T>['afterFind'],
    args: unknown[]
  ): Promise<WithId<T>[]> {
    if (!handler || args.length < 1) {
      return args[0] as WithId<T>[];
    }
  
    return handler<T>(args[0] as WithId<T>[]);
  }