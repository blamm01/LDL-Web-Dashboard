import { IsString, IsNotEmpty } from 'class-validator';

export class getUserCallbackDTO {
  @IsString()
  @IsNotEmpty()
  code: string;
}
