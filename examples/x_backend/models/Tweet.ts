import { Field, FieldBuilder, Model } from "../../../src/index";

export interface Tweet {
    id: string;
    userId: string;
    content: string;
    likesCount: number;
    retweetsCount: number;
    createdAt: Date;
}

export function createTweetModel(db: any): Model<Tweet> {
    return new Model<Tweet>(db, "tweets")
        .addField("id", new FieldBuilder<string>("id").type(String).required().build())
        .addField("userId", new FieldBuilder<string>("userId").type(String).required().build())
        .addField("content", new FieldBuilder<string>("content").type(String).required().build())
        .addField("likesCount", new FieldBuilder<number>("likesCount").type(Number).default(0).build())
        .addField("retweetsCount", new FieldBuilder<number>("retweetsCount").type(Number).default(0).build())
        .addField("createdAt", new FieldBuilder<Date>("createdAt").type(Date).default(() => new Date()).build());
}