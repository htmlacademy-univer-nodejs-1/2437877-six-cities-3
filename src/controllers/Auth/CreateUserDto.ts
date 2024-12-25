import {IsEmail, IsString, Length, IsOptional} from 'class-validator';

export class CreateUserDto {
@IsString()
@Length(1, 15, { message: 'Имя должно быть от 1 до 15 символов.' })
  name!: string;

@IsEmail({}, { message: 'Введите корректный адрес электронной почты.' })
  email!: string;

@IsString()
@Length(6, 12, { message: 'Пароль должен быть от 6 до 12 символов.' })
  password!: string;

@IsString()
@IsOptional()
  isPro!: string;
}
