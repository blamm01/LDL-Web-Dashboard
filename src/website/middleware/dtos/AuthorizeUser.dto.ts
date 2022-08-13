import { IsNotEmpty, IsString } from 'class-validator';

export class AuthorizeUserDTO {
  @IsString()
  @IsNotEmpty()
  authorization: string;
}
