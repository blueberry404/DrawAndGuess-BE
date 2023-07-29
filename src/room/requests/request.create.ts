import { IsEnum, IsNotEmpty, MinLength } from "class-validator"
import { GameMode } from "../gameMode"

export class CreateRoomRequest {

    @IsNotEmpty()
    userId!: string

    @IsNotEmpty()
    name!: string

    @MinLength(6)
    password!: string

    @IsNotEmpty()
    @IsEnum(GameMode)
    mode!: string
}