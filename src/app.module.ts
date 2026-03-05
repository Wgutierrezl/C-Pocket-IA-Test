import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { OpenaiModule } from './openai/openai.module';
import { ToolsModule } from './tools/tools.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [WhatsappModule, OpenaiModule, ToolsModule, MessagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
