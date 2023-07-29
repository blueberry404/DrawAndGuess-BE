import { IsNotEmpty, MinLength } from "class-validator"

export class JoinRoomRequest {

    @IsNotEmpty()
    userId!: string

    @IsNotEmpty()
    name!: string

    @MinLength(6)
    password!: string
}
