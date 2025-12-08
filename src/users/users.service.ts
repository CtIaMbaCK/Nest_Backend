import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // get all
  getUsers() {
    return this.prisma.user.findMany();
  }

  // tim kiem 1 user
  getUser(id: string): Promise<any> {
    return this.prisma.user.findFirst({
      where: { id: Number(id) },
    });
  }

  createUser(body: CreateUserDto): Promise<any> {
    return this.prisma.user.create({
      data: body,
    });
  }
}
