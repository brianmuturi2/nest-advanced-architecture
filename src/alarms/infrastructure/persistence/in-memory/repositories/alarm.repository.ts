import { Injectable } from "@nestjs/common";
import { AlarmRepository } from "src/alarms/application/ports/alarm.repository";
import { Alarm } from "src/alarms/domain/alarm";
import { AlarmMapper } from "../mappers/alarm.mapper";
import { AlarmEntity } from "../entities/alarm.entity";

@Injectable()
export class InMemoryAlarmRepository implements AlarmRepository {

    private readonly alarms = new Map<string, AlarmEntity>();

    constructor() {}

    async findAll(): Promise<Alarm[]> {
        const entities = Array.from(this.alarms.values());
        return entities.map(entity => AlarmMapper.toDomain(entity))
    }

    async save(alarm: Alarm): Promise<Alarm> {
        const persistenceModel = AlarmMapper.toPersistence(alarm)
        this.alarms.set(persistenceModel.id, persistenceModel);

        const entity = this.alarms.get(persistenceModel.id);
        return AlarmMapper.toDomain(entity);
    }
}