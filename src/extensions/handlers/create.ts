import { Document, WithId } from 'mongodb';
import { QueryHandlers } from '../types';

/**
 * Runs the beforeCreate handler for the given model, if it exists.
 * @param handler The beforeCreate handler to run.
 * @param args The arguments to pass to the handler.
 * @returns The result of the handler, or the original arguments if the handler doesn't exist.
 */
export async function handleBeforeCreate<T extends Document>(
  handler: QueryHandlers<T>['beforeCreate'],
  args: unknown[]
): Promise<Partial<T>> {
  if (!handler || args.length < 1) {
    return args[0] as Partial<T>;
  }

  return handler<T>(args[0] as Partial<T>);
}

/**
 * Runs the afterCreate handler for the given model, if it exists.
 * @param handler The afterCreate handler to run.
 * @param args The arguments to pass to the handler.
 * @returns The result of the handler, or the original arguments if the handler doesn't exist.
 */
export async function handleAfterCreate<T extends Document>(
  handler: QueryHandlers<T>['afterCreate'],
  args: unknown[]
): Promise<WithId<T>> {
  if (!handler || args.length < 1) {
    return args[0] as WithId<T>;
  }

  return handler<T>(args[0] as WithId<T>);
}