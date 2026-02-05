import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { EmergencyModule } from '../emergency/emergency.module';

@Module({
  imports: [
    PrismaModule,
    EmergencyModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY || 'mySecretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
