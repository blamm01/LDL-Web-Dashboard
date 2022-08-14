import { IsEmpty, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class GetLogChannel {
    @IsString()
    id: string
}