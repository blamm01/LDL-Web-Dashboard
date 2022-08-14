import { IsNotEmpty, IsString } from "class-validator";

export class GetGuildDTO {
    @IsString()
    @IsNotEmpty()
    id: string
}