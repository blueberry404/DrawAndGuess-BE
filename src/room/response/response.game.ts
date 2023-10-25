export class GameResponse {
    id: string
    mode: string
    gameRounds: number
    status: string
    users!: GameUser[]
    userTurns!: string[]
    adminId!: string
    roomName!: string
    words!: string[][]

    constructor(id: string, mode: string, gameRounds: number, status: string, users: GameUser[], userTurns: string[], adminId: string, name: string, words: string[][]) {
        this.id = id;
        this.mode = mode;
        this.gameRounds = gameRounds;
        this.status = status;
        this.users = users;
        this.userTurns = userTurns;
        this.adminId = adminId;
        this.roomName = name;
        this.words = words;
    }

    toJson = () => ({
        id: this.id,
        mode: this.mode,
        gameRounds: this.gameRounds,
        status: this.status,
        users: this.users.map(user => ({
            id: user.id,
            username: user.username,
            avatarColor: user.avatarColor,
        })),
        userTurns: this.userTurns,
        adminId: this.adminId,
        name: this.roomName,
        words: this.words,
    });
}

export class GameUser {
    id: string
    username: string
    avatarColor: string

    constructor(id: string, username: string, avatarColor: string) {
        this.id = id;
        this.username = username;
        this.avatarColor = avatarColor;
    }
}