import { IsEmail, IsEnum, IsNotEmpty, IsString, IsNumber, MinLength } from 'class-validator'
import { UserRole } from 'src/entities/user.entity'

export class CreateUserDto {
  @IsNotEmpty({ message: 'Імʼя не може бути пустим' })
  @IsString()
  firstName: string

  @IsNotEmpty({ message: 'Прізвище не може бути пустим' })
  @IsString()
  lastName: string

  @IsEmail({}, { message: 'Некоректний email' })
  email: string

  @IsEnum(UserRole)
  role: UserRole

  @IsNotEmpty({ message: 'Ступінь не може бути пустим' })
  @IsString()
  degree: string

  @IsNotEmpty({ message: 'Посада не може бути пустим' })
  @IsString()
  position: string

  @IsNumber()
  departmentId: number
}
