import { IsDefined, IsNotEmpty, MinLength } from "class-validator"

export class CreateRoomRequest {

    @IsNotEmpty()
    userId!: string

    @IsNotEmpty()
    name!: string

    @MinLength(6)
    password!: string
}