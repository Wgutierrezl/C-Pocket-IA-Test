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

    //--- TOOL 2
    {
      type:'function',
      function:{
        name:'getTechNews',
        description:
        'Busca noticias recientes de tecnología por palabra clave. Úsala cuando el usuario pregunte por noticias, últimas novedades tecnológicas, o quiera saber qué hay de nuevo sobre un tema tech.',
        parameters:{
          type:'object',
          properties:{
            keyword:{
              type:'string',
              description:'Palabra clave o tema sobre el que buscar noticias. Ej: "inteligencia artificial", "Apple", "ciberseguridad".',
            }
          },
          required: ['keyword']
        },
      },
    },


    // -- TOOL 3

    {
      type:'function',
      function:{
        name:'searchPublicInfo',
        description:
        'Busca información pública estructurada sobre un tema, concepto, empresa, persona o lugar. Úsala para preguntas de tipo "¿qué es X?", "cuéntame sobre Y", o cuando necesites datos generales.',
        parameters:{
          type:'object',
          properties:{
            query:{
              type:'string',
              description:'Término o concepto a buscar. Ej: "Bitcoin", "NestJS", "Banco de la República".'
            }
          },
          required:['query'],
        },
      },
    },
  ];

  constructor(
    @Inject(TOOL_SERVICE)
    private readonly toolsService: IToolService,
  ) {
    this.client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL:'https://api.groq.com/openai/v1'
    });
  }

  async processMessage(userMessage: string): Promise<OpenAIResponse> {
    const firstResponse = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Eres Pocki, un asistente virtual amigable de C-Pocket. 
            Ayudas a los usuarios con información financiera y consultas generales.
            Responde siempre en español, de forma clara y concisa.
            Tienes acceso a estas herramientas:
            - getTRM: si el usuario pregunta por el dólar, TRM o tasa de cambio.
            - getTechNews: si el usuario pregunta por noticias o novedades tecnológicas.
            - searchPublicInfo: si el usuario pregunta qué es algo o quiere información general sobre un tema.
            Si la pregunta no encaja con ninguna herramienta, responde directamente sin usar ninguna.`,
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
      }else if (toolName === 'getTechNews') {
        // El modelo envía los args como JSON string → hay que parsearlos
        const args = JSON.parse('function' in toolCall && toolCall.function ? toolCall.function.arguments ?? '{}' : '{}');
        toolResult = await this.toolsService.getTechNews(args.keyword ?? '');

      } else if (toolName === 'searchPublicInfo') {
        const args = JSON.parse('function' in toolCall && toolCall.function ? toolCall.function.arguments ?? '{}' : '{}');
        toolResult = await this.toolsService.searchPublicInfo(args.query ?? '');
      }

      const secondResponse = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
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