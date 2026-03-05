import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { TOOL_SERVICE } from './interfaces/tools.tokens';

@Module({
  providers: [
    {
      provide:TOOL_SERVICE,
      useClass: ToolsService
    }
  ],
  exports:[TOOL_SERVICE]
})
export class ToolsModule {}
