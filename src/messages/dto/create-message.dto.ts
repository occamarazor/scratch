import { IsNotEmpty, IsString } from 'class-validator';

export default class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}
