export interface ProcessMessageResult {
  status: 'ok' | 'ignored' | 'error';
}

export interface IWhatsappService{
    processIncomingMessage(body:any) : Promise<ProcessMessageResult>;
}