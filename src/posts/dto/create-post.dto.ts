import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Contenido del post',
    example: 'Este es mi primer post en PeriConecta',
    maxLength: 500
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500, { message: 'El contenido no puede exceder 500 caracteres' })
  content: string;
}