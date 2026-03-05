import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import axios from 'axios';
import { IWhatsappService, ProcessMessageResult } from './interfaces/whatsapp.interface';
import { OPEN_AI_SERVICE } from 'src/openai/interfaces/openai.tokens';
import type { IOpenaiService } from 'src/openai/interfaces/openai.interface';
import { TOOL_SERVICE } from 'src/tools/interfaces/tools.tokens';
import { MESSAGES_SERVICE } from 'src/messages/interfaces/messages.tokens';
import type { IMessageService } from 'src/messages/interfaces/messages.interfaces';

@Injectable()
export class WhatsappService implements IWhatsappService {

    private readonly logger = new Logger(WhatsappService.name);
    private readonly apiUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    constructor(
        @Inject(OPEN_AI_SERVICE)
        private readonly _openaiService:IOpenaiService,

        @Inject(MESSAGES_SERVICE)
        private readonly _messageService:IMessageService
    ){

    }
    async processIncomingMessage(body: any): Promise<ProcessMessageResult> {
        const messageData = this.extractMessage(body);

        if (!messageData) {
            return { status: 'ignored' };
        }

        const { phone, text } = messageData;
        this.logger.log(`Mensaje recibido de ${phone}: ${text}`);

        try {
            // 1. OpenAI analiza intención y ejecuta tool si es necesario
            const { reply, toolUsed } = await this._openaiService.processMessage(text);

            if (toolUsed) {
                this.logger.log(`Tool usada: ${toolUsed}`);
            }

            // 2. Enviar respuesta por WhatsApp
            await this.sendMessage(phone, reply);

            // 3. Persistir en base de datos
            await this._messageService.saveMesage(phone, text, reply);

            return { status: 'ok' };
        } catch (error) {
            this.logger.error('Error procesando mensaje', error);
            await this.sendMessage(phone, 'Lo siento, ocurrió un error. Intenta de nuevo.').catch(() => {});
            return { status: 'error' };
        }
    }

    private async sendMessage(to: string, message: string) : Promise<void> {
        try {
                await axios.post(
                    this.apiUrl,
                    {
                        messaging_product: 'whatsapp',
                        recipient_type: 'individual',
                        to,
                        type: 'text',
                        text: { body: message },
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                            'Content-Type': 'application/json',
                        },
                    },
                );
                this.logger.log(`Mensaje enviado a ${to}`);
        } catch (error) {
            this.logger.error(`Error enviando mensaje a ${to}`, error?.response?.data);
            throw error;
        }
    }

    private extractMessage(body: any): { phone: string; text: string; } | null {
        try {
            const entry = body?.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const message = value?.messages?.[0];

            if (!message || message.type !== 'text') return null;

            return {
                phone: message.from,
                text: message.text.body,
            };
        } catch {
            return null;
        }
    }
}
