import { IsEmail, IsEnum, IsNotEmpty, IsString, IsNumber, MinLength, IsBoolean } from 'class-validator'
import { UserRole, Degree, Position } from 'src/entities/user.entity'
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Імʼя не може бути пустим' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'Прізвище не може бути пустим' })
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsBoolean()
  isAuthor: boolean;

  @IsEmail({}, { message: 'Некоректний email' })
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @Transform(({ value }) => (value in Degree ? Degree[value] : value))
  @IsEnum(Degree, { message: 'Некоректний науковий ступінь' })
  degree: Degree;

  @Transform(({ value }) => (value in Position ? Position[value] : value))
  @IsEnum(Position, { message: 'Некоректна посада' })
  position: Position;

  @IsNumber()
  departmentId: number;
}