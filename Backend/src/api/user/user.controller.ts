import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserEntity } from '../../entities/user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt-access'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createAccountDto: CreateUserDto) {
    return this.userService.create(createAccountDto);
  }

  @Get()
  async find(@Query() filters: Partial<UserEntity>): Promise<UserEntity[]> {
    return this.userService.findWithFilters(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateAccountDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
