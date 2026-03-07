export interface IToolService{
    getTRM() : Promise<string>;
    getTechNews(keyword:string) : Promise<string>;
    searchPublicInfo(query:string) : Promise<string>;
}