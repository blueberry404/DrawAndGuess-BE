export class RoomInfo {

    id: string
    createdAt: string
    status: string

    constructor(id: string, createdAt: string, status: string) {
        this.id = id;
        this.createdAt = createdAt;
        this.status = status;
    }

    toJson = () => ({
        id: this.id,
        createdAt: this.createdAt,
        status: this.status,
    });
}