import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WHATSAPP_SERVICE } from './interfaces/whatsapp.tokens';
import { OpenaiModule } from 'src/openai/openai.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports:[
    OpenaiModule,
    MessagesModule
  ],
  controllers: [WhatsappController],
  providers: [
    {
      provide:WHATSAPP_SERVICE,
      useClass:WhatsappService
    }
  ],
  exports:[WHATSAPP_SERVICE]
})
export class WhatsappModule {}
