import { Inject, Injectable } from '@nestjs/common';
import type { IMessageRepository, IMessageService } from './interfaces/messages.interfaces';
import { Messages } from './entities/message.entity';
import { MESSAGES_REPOSITORY } from './interfaces/messages.tokens';

@Injectable()
export class MessagesService implements IMessageService {
    constructor(
        @Inject(MESSAGES_REPOSITORY)
        private readonly _repo:IMessageRepository

    ){

    }
    async saveMesage(phone: string, userMessage: string, botResponse: string): Promise<Messages> {
        const message=new Messages()

        if(!phone || !userMessage  || !botResponse){
            throw new Error('los mensajes no deben de venir vacios');
        }

        message.phone=phone;
        message.userMessage=userMessage;
        message.botResponse=botResponse;

        const messagesSaved=await this._repo.saveMessage(message);

        if(!messagesSaved){
            throw new Error('no logramos guardar el mensaje en la base de datos');
        }

        return messagesSaved;
    }
}
