import { IsEmpty, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class PostLogChannelParams {
    @IsString()
    id: string
}

export class PostLogChannelBody {
    @IsOptional()
    @IsString()
    log: string | null;
}