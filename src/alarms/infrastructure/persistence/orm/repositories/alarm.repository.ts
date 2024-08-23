import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AlarmRepository } from "src/alarms/application/ports/alarm.repository";
import { AlarmEntity } from "../entities/alarm.entity";
import { Repository } from "typeorm";
import { Alarm } from "src/alarms/domain/alarm";
import { AlarmMapper } from "../mappers/alarm.mapper";

@Injectable()
export class OrmAlarmRepository implements AlarmRepository {
    constructor(
        @InjectRepository(AlarmEntity)
        private readonly alarmRepository: Repository<AlarmEntity>
    ) {}

    async findAll(): Promise<Alarm[]> {
        const entities = await this.alarmRepository.find();
        return entities.map(entity => AlarmMapper.toDomain(entity))
    }

    async save(alarm: Alarm): Promise<Alarm> {
        const persistenceModel = AlarmMapper.toPersistence(alarm)
        const entity = await this.alarmRepository.save(persistenceModel);
        return AlarmMapper.toDomain(entity);
    }
}