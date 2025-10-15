import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'alias', 'birthDate', 'email'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByAlias(alias: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { alias },
      select: ['id', 'firstName', 'lastName', 'alias', 'birthDate', 'email'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async getProfile(userId: number) {
    const user = await this.findById(userId);
    
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      alias: user.alias,
      birthDate: user.birthDate,
      email: user.email,
    };
  }
}