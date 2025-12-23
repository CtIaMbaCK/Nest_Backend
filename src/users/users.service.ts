import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { helpHashPassword } from 'src/helpers/utils';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // get all
  getUsers() {
    return this.prisma.user.findMany();
  }

  // tim kiem 1 user
  getUser(id: string): Promise<any> {
    try {
      return this.prisma.user.findFirst({
        where: { id: String(id) },
      });
    } catch (error) {
      throw new Error('Lỗi xảy ra', { cause: error });
    }
  }

  // tao user
  createUSer() {}

  // async createUser(body: CreateUserDto): Promise<any> {
  //   // hash
  //   // viet them try catch de bat loi
  //   const hashPassword: string = await helpHashPassword(body.password);
  //   // return this.prisma.user.create({
  //   //   data: body,
  //   // });
  //   return 'tao user moi';
  // }
}
