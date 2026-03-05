import { Injectable } from '@nestjs/common';
import axios from 'axios';
import cheerio from 'cheerio';
import { IToolService } from './interfaces/tools.service.interface';

@Injectable()
export class ToolsService implements IToolService {

    async getTRM() : Promise<string>{
        const { data } = await axios.get('https://www.dolar-colombia.com/');
        const $ = cheerio.load(data);
        const price = $('.exchange-rate').first().text();
        return `La TRM actual es ${price}`;
    }

}
