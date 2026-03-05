// src/openai/openai.service.ts
import { Inject, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { TOOL_SERVICE } from 'src/tools/interfaces/tools.tokens';
import type { IToolService } from 'src/tools/interfaces/tools.service.interface';
import { IOpenaiService, OpenAIResponse } from './interfaces/openai.interface';

@Injectable()
export class OpenaiService implements IOpenaiService{
  private readonly client: OpenAI;

  private readonly tools: OpenAI.Chat.ChatCompletionTool[] = [
    {
      type: 'function',
      function: {
        name: 'getTRM',
        description:
          'Obtiene la TRM actual (precio del dólar en Colombia). Úsala cuando el usuario pregunte por el dólar, TRM, precio del dólar, o tasa de cambio.',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      }
    },
  ];

  constructor(
    @Inject(TOOL_SERVICE)
    private readonly toolsService: IToolService,
  ) {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processMessage(userMessage: string): Promise<OpenAIResponse> {
    const firstResponse = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Eres Pocki, un asistente virtual amigable de C-Pocket. 
            Ayudas a los usuarios con información financiera y consultas generales.
            Responde siempre en español, de forma clara y concisa.
            Si el usuario pregunta por el dólar, TRM o tasa de cambio, usa la herramienta getTRM.`,
        },
        { role: 'user', content: userMessage },
      ],
      tools: this.tools,
      tool_choice: 'auto',
    });

    const message = firstResponse.choices[0].message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];

      let toolName: string | undefined;
      let toolCallId: string | undefined;

      if ('function' in toolCall && toolCall.function != null) {
        toolName = toolCall.function.name;
        toolCallId = toolCall.id;
      }

      let toolResult = '';
      if (toolName === 'getTRM') {
        toolResult = await this.toolsService.getTRM();
      }

      const secondResponse = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres Pocki, un asistente virtual amigable de C-Pocket.
                Responde siempre en español, de forma clara y concisa.`,
          },
          { role: 'user', content: userMessage },
          message,
          {
            role: 'tool',
            tool_call_id: toolCallId ?? '',
            content: toolResult,
          },
        ],
        tools: this.tools,
      });

      return {
        reply: secondResponse.choices[0].message.content ?? 'Sin respuesta',
        toolUsed: toolName,
      };
    }

    return {
      reply: message.content ?? 'Sin respuesta',
    };
  }
}