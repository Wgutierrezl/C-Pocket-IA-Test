import { Controller, Get, Post, Body, Query, HttpCode, HttpException, HttpStatus, Logger, Inject } from '@nestjs/common';
import { WHATSAPP_SERVICE } from './interfaces/whatsapp.tokens';
import type { IWhatsappService } from './interfaces/whatsapp.interface';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Webhook')
@Controller('webhook')
export class WhatsappController {
    private readonly logger=new Logger(WhatsappController.name);
    constructor(
        @Inject(WHATSAPP_SERVICE)
        private readonly _whatsService:IWhatsappService
    ){}

    @ApiOperation({
        summary: 'Verificación del webhook',
        description: 'Meta llama este endpoint para verificar que el webhook es válido. Responde con el challenge recibido.',
    })
    @ApiQuery({ name: 'hub.mode', required: true, example: 'subscribe' })
    @ApiQuery({ name: 'hub.verify_token', required: true, example: 'tu_token_secreto' })
    @ApiQuery({ name: 'hub.challenge', required: true, example: '1234567890' })
    @ApiResponse({ status: 200, description: 'Webhook verificado, retorna el challenge', type: String })
    @ApiResponse({ status: 403, description: 'Token inválido' })
    @Get()
    verifyWebhook(@Query() query: any) : string { 
        const mode = query['hub.mode'];
        const token = query['hub.verify_token'];
        const challenge = query['hub.challenge'];

        if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
            this.logger.log('Webhook verificado correctamente');
            return challenge; // NestJS devuelve 200 automáticamente
        }

        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    @Post()
    @HttpCode(200)
    @ApiOperation({
        summary: 'Recibe mensajes de WhatsApp',
        description: 'Meta envía aquí los mensajes entrantes. El bot los procesa con OpenAI y responde al usuario.',
    })
    @ApiBody({
        description: 'Payload estándar de Meta WhatsApp Cloud API',
        schema: 
        {
            example: 
            {
                object: 'whatsapp_business_account',
                    entry: [
                        {
                            changes: [
                                {
                                    value: {
                                        messages: [
                                            {
                                                from: '573215762469',
                                                type: 'text',
                                                text: { body: '¿Cuál es la TRM hoy?' },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Mensaje procesado correctamente',
        schema: { example: { status: 'ok' } },
    })
    @ApiResponse({
        status: 200,
        description: 'Mensaje ignorado (no es texto o formato inválido)',
        schema: { example: { status: 'ignored' } },
    })
    async handleMessage(@Body() body:any){
        return this._whatsService.processIncomingMessage(body);
    }

}
