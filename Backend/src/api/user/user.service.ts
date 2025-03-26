import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createAccountDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createAccountDto.password, 10);
    const newAccount = this.userRepository.create({
      ...createAccountDto,
      password: hashedPassword,
    });
    return this.userRepository.save(newAccount);
  }

  findById(id: number) {
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

  update(id_account: number, updateAccountDto: UpdateUserDto) {
    return this.userRepository.update(id_account, updateAccountDto);
  }

  remove(id_account: number) {
    return this.userRepository.delete(id_account);
  }
}
