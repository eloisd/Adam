import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserEntity } from '../../entities/user.entity';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt-access'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() user: UserEntity) {
    return this.userService.create(user);
  }

  @Get()
  async find(@Query() filters: Partial<UserEntity>): Promise<UserEntity[]> {
    return this.userService.findWithFilters(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() user: Partial<UserEntity>,
  ) {
    return this.userService.update(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
