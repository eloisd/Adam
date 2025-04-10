import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(user: UserEntity) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newAccount = this.userRepository.create({
      ...user,
      password: hashedPassword,
    });
    return this.userRepository.save(newAccount);
  }

  findById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async findWithFilters(filters: Partial<UserEntity>): Promise<UserEntity[]> {
    const query = this.userRepository.createQueryBuilder('user');

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query.andWhere(`user.${key} = :${key}`, { [key]: value });
      }
    });

    return query.getMany();
  }

  update(id: string, user: Partial<UserEntity>) {
    return this.userRepository.update(id, user);
  }

  remove(id: string) {
    return this.userRepository.delete(id);
  }
}
