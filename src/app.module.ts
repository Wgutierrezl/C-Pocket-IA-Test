import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { OpenaiModule } from './openai/openai.module';
import { ToolsModule } from './tools/tools.module';
import { MessagesModule } from './messages/messages.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url:process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,

      ssl: {
        rejectUnauthorized: false,
      },

      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    WhatsappModule, 
    OpenaiModule, 
    ToolsModule, 
    MessagesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
