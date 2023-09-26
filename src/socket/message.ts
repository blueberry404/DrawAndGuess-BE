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
    canvasState?: CanvasState

    constructor(data: Partial<WSPayload>) {
        Object.assign(this, data);
    }
}

export class CanvasState {
    polygons!: CanvasPolygon[]
}

export class CanvasPolygon {
    offsets!: Offset[]
    strokeWidth!: number
    paintColor!: Color
}

export class Offset {
    x!: number
    y!: number
}

export class Color {
    argb!: number
}