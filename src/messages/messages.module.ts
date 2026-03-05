import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Messages } from './entities/message.entity';
import { MessagesRepository } from './messages.repository';
import { MESSAGES_REPOSITORY, MESSAGES_SERVICE } from './interfaces/messages.tokens';

@Module({
  imports:[
    TypeOrmModule.forFeature([Messages])
  ],
  controllers: [MessagesController],
  providers: [
    {
      provide:MESSAGES_REPOSITORY,
      useClass: MessagesRepository
    },
    {
      provide: MESSAGES_SERVICE,
      useClass: MessagesService
    }
  ],
  exports:[MESSAGES_REPOSITORY, MESSAGES_SERVICE]
})
export class MessagesModule {}
