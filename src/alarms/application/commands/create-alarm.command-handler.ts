import { CommandHandler, EventBus, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { CreateAlarmCommand } from "./create-alarm.command";
import { Logger } from "@nestjs/common";
import { CreateAlarmRepository } from "../ports/create-alarm.repository";
import { AlarmFactory } from "src/alarms/domain/factories/alarm.factory";
import { AlarmCreatedEvent } from "src/alarms/domain/events/alarm-created.event";

@CommandHandler(CreateAlarmCommand)
export class CreateAlarmCommandHandler implements ICommandHandler<CreateAlarmCommand> {
    private readonly logger = new Logger(CreateAlarmCommandHandler.name);

    constructor(
        //private readonly alarmRepository: CreateAlarmRepository,
        private readonly alarmFactory: AlarmFactory,
        private readonly eventPublisher: EventPublisher
        //private readonly eventBus: EventBus
    ){}

    async execute(command: CreateAlarmCommand): Promise<any> {
        this.logger.debug(
            `Processing "CreateAlarmCommand": ${JSON.stringify(command)}`
        );
        const alarm = this.alarmFactory.create(
            command.name, 
            command.severity,
            command.triggeredAt,
            command.items
        );

        // This is not yet the best way to dispatch events
        // Domain events should be dispatched from the aggreagete root, inside the domain layer
        // We'll cover this in upcoming lessons
        
        //const newAlarm = await this.alarmRepository.save(alarm);
        //this.eventBus.publish(new AlarmCreatedEvent(alarm));

        this.eventPublisher.mergeObjectContext(alarm);
        alarm.commit();

        return alarm;
    }
}