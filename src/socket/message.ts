export class WSMessage {
    type!: string
    payload!: WSPayload

    constructor(type: string, payload: WSPayload) {
        this.type = type;
        this.payload = payload;
    }
}

export class WSPayload {
    userId!: string
    roomId!: string
    error?: string
    userIds?: string[]

    constructor(data: Partial<WSPayload>) {
        Object.assign(this, data);
    }
}
