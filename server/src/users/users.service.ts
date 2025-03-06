import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../entities/user.entity';
import { Department } from '../entities/department.entity';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return user;
  }
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    return user;
  }

  async create(body: { 
    lastName: string; 
    firstName: string; 
    email: string; 
    password: string; 
    role: UserRole;
    departmentId: number;
    degree: string;
    position: string;
  }): Promise<User> {
    const department = await this.departmentRepository.findOne({ where: { id: body.departmentId } });

    if (!department) {
      throw new Error('Кафедра не знайдена');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = this.userRepository.create({ 
      ...body, 
      password: hashedPassword, 
      department 
    });

    return this.userRepository.save(user);
  }

  async update(id: number, body: { 
    lastName?: string; 
    firstName?: string; 
    email?: string; 
    password?: string; 
    role?: string;
    departmentId?: number;
    degree?: string;
    position?: string;
  }): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Користувач не знайдений');
    }

    if (body.departmentId) {
      const department = await this.departmentRepository.findOne({ where: { id: body.departmentId } });
      if (!department) {
        throw new NotFoundException('Кафедра не знайдена');
      }
      user.department = department;
    }

    if (body.password) {
      user.password = await bcrypt.hash(body.password, 10);
    }

    Object.assign(user, body);
    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Користувач не знайдений');
    }

    await this.userRepository.remove(user);
    return { message: 'Користувач успішно видалений' };
  }
}
