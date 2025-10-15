import { IsEmail, IsNotEmpty, MinLength, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@example.com',
    format: 'email'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'password123',
    minLength: 6
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan'
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez'
  })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Alias único del usuario',
    example: 'juanp'
  })
  @IsNotEmpty()
  alias: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del usuario',
    example: '1990-05-15',
    format: 'date'
  })
  @IsDateString()
  birthDate: string;
}