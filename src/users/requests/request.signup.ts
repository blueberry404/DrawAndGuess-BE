import {
    IsEmail,
    MaxLength,
    MinLength
} from 'class-validator';

export class UserSignupRequest {

    @MinLength(8)
    username!: string

    @IsEmail()
    email?: string

    @MinLength(6)
    @MaxLength(20)
    password?: string
    
    isGuestUser!: boolean
}
