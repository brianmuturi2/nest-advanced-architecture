import { Injectable } from "@nestjs/common";
import { Alarm } from "src/alarms/domain/alarm";
import { AlarmMapper } from "../mappers/alarm.mapper";
import { AlarmEntity } from "../entities/alarm.entity";
import { FindAlarmsRepository } from "src/alarms/application/ports/find-alarm.repository";
import { AlarmReadModel } from "src/alarms/domain/read-models/alarm.read-model";
import { CreateAlarmRepository } from "src/alarms/application/ports/create-alarm.repository";
import { UpsertMaterializedAlarmRepository } from "src/alarms/application/ports/upsert-materialized-alarm.repository";

@Injectable()
export class InMemoryAlarmRepository implements CreateAlarmRepository, FindAlarmsRepository, UpsertMaterializedAlarmRepository {

    private readonly alarms = new Map<string, AlarmEntity>();
    private readonly materializedAlarmViews = new Map<string, AlarmReadModel>();

    constructor() {}

    async findAll(): Promise<AlarmReadModel[]> {
        return Array.from(this.materializedAlarmViews.values())
    }

    async save(alarm: Alarm): Promise<Alarm> {
        const persistenceModel = AlarmMapper.toPersistence(alarm)
        this.alarms.set(persistenceModel.id, persistenceModel);

        const entity = this.alarms.get(persistenceModel.id);
        return AlarmMapper.toDomain(entity);
    }

    async upsert(alarm: Pick<AlarmReadModel, "id"> & Partial<AlarmReadModel>): Promise<void> {
        if (this.materializedAlarmViews.has(alarm.id)) {
            this.materializedAlarmViews.set(alarm.id, {
                ...this.materializedAlarmViews.get(alarm.id),
                ...alarm
            });
            return;
        }
        this.materializedAlarmViews.set(alarm.id, alarm as AlarmReadModel);
    }
}