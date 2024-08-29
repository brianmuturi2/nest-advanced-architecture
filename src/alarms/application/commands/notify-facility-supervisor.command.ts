export class NotifyFacilitySupervisorCommand {
    constructor(
        private readonly facilityId: string,
        public readonly alarmIds: string[],
    ) {}
}