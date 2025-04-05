import { IsEmail, IsEnum, IsOptional, IsString, IsNumber, MinLength, IsNotEmpty } from 'class-validator'
import { UserRole, Position, Degree } from 'src/entities/user.entity'
import { Transform } from 'class-transformer';
export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Імʼя не може бути пустим' })
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Прізвище не може бути пустим' })
  lastName: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некоректний email' })
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Пароль має містити мінімум 6 символів' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @Transform(({ value }) => (value in Degree ? Degree[value] : value))
  @IsEnum(Degree, { message: 'Некоректний науковий ступінь' })
  degree?: Degree | null;

  @IsOptional()
  @Transform(({ value }) => (value in Position ? Position[value] : value))
  @IsEnum(Position, { message: 'Некоректна посада' })
  position?: Position;

  @IsOptional()
  @IsNumber()
  departmentId?: number;
}
