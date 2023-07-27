export class WSMessage {
    type!: string
    payload!: WSPayload
}

export class WSPayload {
    userId!: string
    roomId!: string
}

export class WSClientMessage {

    type!: string
    payload!: WSClientPayload

    constructor(type: string, payload: WSClientPayload) {
        this.type = type;
        this.payload = payload;
    }
}

export class WSClientPayload {
    error?: string

    constructor(error: string) {
        this.error = error;
    }
}