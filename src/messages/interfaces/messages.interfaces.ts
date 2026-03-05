import { Messages } from "../entities/message.entity";

export interface IMessageService{
    saveMesage(phone:string, userMessage:string, botResponse:string) : Promise<Messages>;
}

export interface IMessageRepository{
    saveMessage(data:Messages) : Promise<Messages>;
}