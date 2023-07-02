export class UserResponse {

    id: string
    userName: string
    isGuestUser: boolean
    createdAt: Date

    constructor(_id: string, _username: string, isGuest: boolean, _createdAt: Date) {
        this.id = _id
        this.userName = _username
        this.isGuestUser = isGuest
        this.createdAt = _createdAt
    }

    toJson = () => ({
        id: this.id,
        username: this.userName,
        isGuestUser: this.isGuestUser,
        createdAt: this.createdAt.toISOString(),
    })
}