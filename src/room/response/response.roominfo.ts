export class RoomInfo {

    id: string
    createdAt: string
    status: string
    password: string

    constructor(id: string, createdAt: string, status: string, password: string) {
        this.id = id;
        this.createdAt = createdAt;
        this.status = status;
        this.password = password;
    }

    toJson = () => ({
        id: this.id,
        createdAt: this.createdAt,
        status: this.status,
    });
}