import { IsString, IsNotEmpty } from 'class-validator';

export class getUserCallbackDTO {
  @IsString()
  code?: string;
}
