import { IsString, IsNotEmpty } from 'class-validator';

export class getCallbackCodeDTO {
  @IsString()
  @IsNotEmpty()
  code: string;
}
