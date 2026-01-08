import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApi(): string {
    return 'Thêm /api sau uri để xem backend';
  }
}
