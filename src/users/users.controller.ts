import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './DTO/create-user.dto';
import { UpdateUserDto } from './DTO/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getUsers() {
    return this.userService.getUser();
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return `User ${id}`;
  }

  @Post()
  createUser(
    @Body()
    body: CreateUserDto,
  ) {
    return body;
  }

  @Patch(':id')
  updateUserById(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return [{ id, body }];
  }

  @Delete(':id')
  deleteUserById(@Param('id') id: string) {
    return `User ${id} deleted`;
  }
}
