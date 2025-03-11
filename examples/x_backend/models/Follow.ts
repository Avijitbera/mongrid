import { Field, FieldBuilder, Model } from "../../../src/index";

export interface Follow {
    id: string;
    followerId: string;
    followeeId: string;
    createdAt: Date;
}

export function createFollowModel(db: any): Model<Follow> {
    return new Model<Follow>(db, "follows")
        .addField("id", new FieldBuilder<string>("id").type(String).required().build())
        .addField("followerId", new FieldBuilder<string>("followerId").type(String).required().build())
        .addField("followeeId", new FieldBuilder<string>("followeeId").type(String).required().build())
        .addField("createdAt", new FieldBuilder<Date>("createdAt").type(Date).default(() => new Date()).build());
}