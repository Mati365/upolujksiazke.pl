import {Controller, Post, Res} from '@nestjs/common';
import {Response} from 'express';
import {ScrapperService} from './service/Scrapper.service';

@Controller()
export class ScrapperController {
  constructor(
    private readonly scrapper: ScrapperService,
  ) {}

  @Post('/scrapper')
  async post(@Res() res: Response) {
    const a = await this.scrapper.latest();
    console.info(a);

    res.send(
      {
        ok: true,
      },
    );
  }
}
