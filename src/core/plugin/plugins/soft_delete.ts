import { Document, ObjectId } from "mongodb";
import { Plugin } from "../plugin";
import { Model } from "../../model";
import { Field } from "../../fields/Field";
import { QueryBuilder } from "../../QueryBuilder";


export class SoftDeletePlugin<T extends Document> implements Plugin<T> {
    private readonly deletedAtField: string = 'deletedAt';

    installModel(model: Model<T>): void {
        model.addField(this.deletedAtField, new Field<Date | null>(this.deletedAtField).type(Date));

        model.softDelete = async(id:ObjectId): Promise<void> => {
            await model.updateById(id, {
                [this.deletedAtField]:new Date()
            } as Partial<T>)
        }

        model.restore = async(id: ObjectId): Promise<void> => {
            await model.updateById(id, {
                [this.deletedAtField]:null
            } as Partial<T>)
        }
        const originalFind = model.find.bind(model);
        model.find = async (filter = {}, options = {}, populatedFields = []): Promise<T[]> => {
            const softDeleteFilter = { [this.deletedAtField]: null };
            return originalFind({ ...filter, ...softDeleteFilter }, options, populatedFields);
        };
    }

    installQueryBuilder(queryBuilder: QueryBuilder<T>): void {
        queryBuilder.withDeleted = (): QueryBuilder<T> => {
            return queryBuilder.where(this.deletedAtField, "exists", true)
        }
    }
}