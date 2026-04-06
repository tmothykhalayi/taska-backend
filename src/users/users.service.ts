import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    this.validateRoleAndStatus(createUserDto.role, createUserDto.status);

    const [firstName, ...rest] = createUserDto.name.trim().split(/\s+/);
    const lastName = rest.join(' ');
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName,
      lastName: lastName || firstName,
      role: createUserDto.role,
      status: createUserDto.status,
    });

    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['tasks'] });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['tasks'] });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.name) {
      const [firstName, ...rest] = updateUserDto.name.trim().split(/\s+/);
      const lastName = rest.join(' ');
      user.firstName = firstName;
      user.lastName = lastName || firstName;
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.role || updateUserDto.status) {
      this.validateRoleAndStatus(
        (updateUserDto.role as UserRole) || user.role,
        (updateUserDto.status as string) || user.status,
      );
    }

    if (updateUserDto.role) {
      user.role = updateUserDto.role as UserRole;
    }

    if (updateUserDto.status) {
      user.status = updateUserDto.status;
    }

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createUserWithRole(data: Partial<User> & { role: string }): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  private validateRoleAndStatus(role: UserRole, status: string) {
    if (!Object.values(UserRole).includes(role)) {
      throw new BadRequestException('Invalid role. Use tasker or admin.');
    }

    if (!['active', 'inactive'].includes(status)) {
      throw new BadRequestException('Invalid status. Use active or inactive.');
    }
  }
}