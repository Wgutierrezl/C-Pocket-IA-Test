export interface OpenAIResponse {
  reply: string;
  toolUsed?: string;
}

export interface IOpenaiService{
    processMessage(userMessage:string) : Promise<OpenAIResponse>;

}