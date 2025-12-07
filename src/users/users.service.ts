import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getUser() {
    return [{ id: 1, name: 'John Doe' }];
  }
}
