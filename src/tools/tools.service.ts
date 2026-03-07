import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio'; 
import { IToolService } from './interfaces/tools.service.interface';

@Injectable()
export class ToolsService implements IToolService {

    async getTechNews(keyword: string): Promise<string> {
         const url = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword + ' tecnología')}&hl=es-419&gl=CO&ceid=CO:es-419`;

         const {data}=await axios.get(url);
         const $=cheerio.load(data,{xmlMode:true})

         const articles:string[]=[];

         $('item').slice(0, 5).each((_, el) => {
            const title = $(el).find('title').text();
            const link  = $(el).find('link').text();
            const pubDate = $(el).find('pubDate').text();
            articles.push(`• ${title}\n  📅 ${pubDate}\n  🔗 ${link}`);
         });

         if (articles.length === 0) {
          return `No encontré noticias recientes sobre "${keyword}".`;
        }

        return `Noticias recientes sobre "${keyword}":\n\n${articles.join('\n\n')}`;
    }
    async searchPublicInfo(query: string): Promise<string> {
        const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

        try{
            const {data}=await axios.get(url);

            // La API devuelve JSON estructurado directamente
            return [
                `📌 *${data.title}*`,
                ``,
                data.extract ?? 'Sin descripción disponible.',
                ``,
                `🔗 Fuente: ${data.content_urls?.desktop?.page ?? 'Wikipedia'}`,
            ].join('\n');

        }catch(error:any){
            return `No encontré información pública sobre "${query}". Intenta con otro término.`;
        }
        

    }

    async getTRM() : Promise<string>{
        const { data } = await axios.get('https://www.dolar-colombia.com/');
        const $ = cheerio.load(data);
        const price = $('.exchange-rate').first().text();
        return `La TRM actual es ${price}`;
    }

}
