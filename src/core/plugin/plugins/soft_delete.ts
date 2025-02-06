import { Document, ObjectId } from "mongodb";
import { Plugin } from "../plugin";
import { Model } from "../../model";
import { Field } from "../../fields/Field";


export class SoftDeletePlugin<T extends Document> implements Plugin<T> {
    private readonly deletedAtField: string = 'deletedAt';

    installModel(model: Model<T>): void {
        model.addField(this.deletedAtField, new Field<Date | null>(this.deletedAtField).type(Date));

        model.softDelete = async(id:ObjectId): Promise<void> => {
            await model.updateById(id, {
                [this.deletedAtField]:new Date()
            } as Partial<T>)
        }
    }
}