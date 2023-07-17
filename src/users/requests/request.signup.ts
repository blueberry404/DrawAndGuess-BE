import {
    IsEmail,
    IsOptional,
    MaxLength,
    MinLength
} from 'class-validator';

export class UserSignupRequest {

    @IsOptional()
    @MinLength(8)
    username?: string

    @IsOptional()
    @IsEmail()
    email?: string

    @IsOptional()
    @MinLength(6)
    @MaxLength(20)
    password?: string
    
    isGuestUser!: boolean
}
