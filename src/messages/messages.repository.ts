
import { Inject, Injectable } from "@nestjs/common";
import { IMessageRepository } from "./interfaces/messages.interfaces";
import { Messages } from "./entities/message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


@Injectable()
export class MessagesRepository implements IMessageRepository{

    constructor(
        @InjectRepository(Messages)
        private readonly _context:Repository<Messages>
    ){

    }

    async saveMessage(data: Messages): Promise<Messages> {
        return await this._context.save(data);
    }
    
}
