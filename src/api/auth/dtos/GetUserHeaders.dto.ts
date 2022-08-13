import { IsString, IsNotEmpty } from 'class-validator';

export class GetUserHeadersDTO {
  @IsString()
  @IsNotEmpty()
  authorization: string;
}
