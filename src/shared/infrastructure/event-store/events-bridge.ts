import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { EVENT_STORE_CONNECTION } from "src/core/core.constants";
import { ChangeStream, ChangeStreamInsertDocument } from "mongodb";
import { Event, EventDocument } from './schemas/event.schema';
import { Model } from "mongoose";
import { EventBus } from "@nestjs/cqrs";
import { EventDeserializer } from './deserializers/event.deserializer';

@Injectable()
export class EventsBridge implements OnApplicationBootstrap, OnApplicationShutdown {

    private changeStream: ChangeStream;

    constructor(
        @InjectModel(Event.name, EVENT_STORE_CONNECTION)
        private readonly eventStore: Model<Event>,
        private readonly eventBus: EventBus,
        private eventDeserializer: EventDeserializer
    ) {}

    onApplicationBootstrap() {
        // In the poll-based approach, instead of using a change stram (as we're doing here), we would periodically
        // poll the event store for new events. TO keep track of what events we already processed,
        // we would need to store the last processed event (cursor) in a separate collection
        this.changeStream = this.eventStore
            .watch()
            .on('change', (change: ChangeStreamInsertDocument<EventDocument>) => {
                if (change.operationType === 'insert') {
                    this.handleEventStoreChange(change);
                }
            });
    }

    onApplicationShutdown(signal?: string) {
        return this.changeStream.close();
    }

    handleEventStoreChange(change: ChangeStreamInsertDocument<EventDocument>) {
        // "ChangeStreamInsertDocument" object exposes the "txnNumber" property which represent
        // the transaction identifier. If you need multi document transactions in your application,
        // you can use this property to achieve atomicity
        const insertEvent = change.fullDocument;

        const eventInstance = this.eventDeserializer.deserialize(insertEvent);
        this.eventBus.subject$.next(eventInstance.data);
    }
}