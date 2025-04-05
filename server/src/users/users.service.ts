import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Degree, Position } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Department } from '../entities/department.entity';
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import * as crypto from "crypto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    private readonly mailService: MailService
  ) { }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['department', 'department.unit'] });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['department'] });
    if (!user) {
      throw new NotFoundException(`Користувача з ID ${id} не знайдено`);
    }
    return user;
  }
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email }, relations: ['department'] });
    return user || null;
  }

  async create(dto: CreateUserDto) {
    const { departmentId, email, degree, position, ...rest } = dto;
  
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
    });
    if (!department) throw new NotFoundException("Кафедру не знайдено");
  
    const generatedPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
  
    const user = this.userRepository.create({
      ...rest,
      email,
      password: hashedPassword,
      department,
      degree: degree ?? Degree.NONE, 
      position: position ?? Position.LECTURER, 
    });
  
    await this.userRepository.save(user);
  
    await this.mailService.sendMail({
      to: email,
      subject: "Ваш акаунт створено",
      text: `Ваш пароль для входу в систему: ${generatedPassword}`,
    });
  
    return user;
  }
  
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("Користувача не знайдено");
  
    if (dto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: dto.departmentId },
      });
      if (!department) throw new NotFoundException("Кафедру не знайдено");
      user.department = department;
    }
  
    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }
  
    const { departmentId, password, ...rest } = dto;
    Object.assign(user, {
      ...rest,
      degree: dto.degree ?? user.degree,
      position: dto.position ?? user.position,
    });
  
    return this.userRepository.save(user);
  }
  
  

  async updatePassword(id: number, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("Користувача не знайдено");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword
    await this.userRepository.save(user);

    return { message: "Пароль успішно оновлено" };
  }

  async updateEmail(id: number, newEmail: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("Користувача не знайдено");
    }
    user.email = newEmail;
    await this.userRepository.save(user);
    return { message: "Емейл успішно оновлено" };
  }

  async delete(id: number) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) throw new NotFoundException('Користувача не знайдено')
    return this.userRepository.remove(user)
  }
}
