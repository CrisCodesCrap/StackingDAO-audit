export interface PubSubClient {
    publish<T>(message: T): Promise<void>;
}

export class LocalPubsub implements PubSubClient {
    async publish<T>(message: T): Promise<void> {
        console.log(message);
    }
}
