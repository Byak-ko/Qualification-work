import { IsEmail, IsEnum, IsOptional, IsString, IsNumber, MinLength , IsNotEmpty} from 'class-validator'
import { UserRole } from 'src/entities/user.entity'
  
  export class UpdateUserDto {
    @IsOptional()
    @IsNotEmpty({ message: 'Імʼя не може бути пустим' })
    @IsString()
    firstName: string
  
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Прізвище не може бути пустим' })
    lastName: string
  
    @IsOptional()
    @IsEmail({}, { message: 'Некоректний email' })
    email: string
  
    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'Пароль має містити мінімум 6 символів' })
    password: string
  
    @IsOptional()
    @IsEnum(UserRole)
    role: UserRole
  
    @IsOptional()
    @IsNotEmpty({ message: 'Ступінь не може бути пустим' })
    @IsString()
    degree: string
  
    @IsOptional()
    @IsNotEmpty({ message: 'Посада не може бути пустим' })
    @IsString()
    position: string
  
    @IsOptional()
    @IsNumber()
    departmentId?: number
  }
  