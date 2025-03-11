import { Field, FieldBuilder, Model } from "../../../src/index";

export interface Like {
    id: string;
    userId: string;
    tweetId: string;
    createdAt: Date;
}

export function createLikeModel(db: any): Model<Like> {
    return new Model<Like>(db, "likes")
        .addField("id", new FieldBuilder<string>("id").type(String).required().build())
        .addField("userId", new FieldBuilder<string>("userId").type(String).required().build())
        .addField("tweetId", new FieldBuilder<string>("tweetId").type(String).required().build())
        .addField("createdAt", new FieldBuilder<Date>("createdAt").type(Date).default(() => new Date()).build());
}