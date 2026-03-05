import { Module } from '@nestjs/common';
import { ToolsModule } from 'src/tools/tools.module';
import { OpenaiService } from './openai.service';
import { OPEN_AI_SERVICE } from './interfaces/openai.tokens';

@Module({
  imports:[
    ToolsModule
  ],
  providers: [
    {
      provide:OPEN_AI_SERVICE,
      useClass: OpenaiService
    }
  ],
  exports:[OPEN_AI_SERVICE]
})
export class OpenaiModule {}
