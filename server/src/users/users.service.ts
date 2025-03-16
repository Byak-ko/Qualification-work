import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['department'] });
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
    const { departmentId, password, ...rest } = dto

    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
    })
    if (!department) throw new NotFoundException('Кафедру не знайдено')

    const user = this.userRepository.create({
      ...rest,
      department,
      password: await bcrypt.hash(password, 10),
    })

    return this.userRepository.save(user)
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) throw new NotFoundException('Користувача не знайдено')

    if (dto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: dto.departmentId },
      })
      if (!department) throw new NotFoundException('Кафедру не знайдено')
      user.department = department
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10)
    }

    const { departmentId, password, ...rest } = dto
    Object.assign(user, rest)
    return this.userRepository.save(user)
  }

  async delete(id: number) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) throw new NotFoundException('Користувача не знайдено')
    return this.userRepository.remove(user)
  }
}
