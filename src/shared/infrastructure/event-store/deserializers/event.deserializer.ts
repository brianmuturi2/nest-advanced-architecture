import { Injectable, Type } from "@nestjs/common";
import { Event } from '../schemas/event.schema';
import { SerializableEvent } from "src/shared/domain/interfaces/serializable-event";
import { AlarmCreatedEvent } from "src/alarms/domain/events/alarm-created.event";
import { EventClsRegistry } from "../event-cls.registry";

@Injectable()
export class EventDeserializer {
    deserialize<T>(event: Event): SerializableEvent {
        const eventCls = this.getEventClassByType(event.type);
        return {
            ...event,
            data: this.instantiateSerializedEvent(eventCls, event.data)
        }
    }

    getEventClassByType(type: string) {
        // We'll show a more scalable approach later
        /*  switch(type) {
                case AlarmCreatedEvent.name:
                    return AlarmCreatedEvent
        } */

        return EventClsRegistry.get(type);
    }

    instantiateSerializedEvent<T extends Type>(
        eventCls: T,
        data: Record<string, any>
    ) {
        return Object.assign(Object.create(eventCls.prototype), data);
    }
}