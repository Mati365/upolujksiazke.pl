import {Body, Controller, Post, Res} from '@nestjs/common';
import {Response} from 'express';

import {Accepts} from '@server/common/decorators/Accepts.decorator';
import {TrackRecordDto} from '@server/modules/tracker/dto/TrackRecord.dto';
import {APIClientService} from '../../services/APIClient.service';

@Controller('tracker')
export class APITrackerController {
  constructor(
    private readonly apiClientService: APIClientService,
  ) {}

  /* eslint-disable @typescript-eslint/indent */
  @Accepts('application/json')
  @Post()
  async trackView(
    @Res() res: Response,
    @Body() data: TrackRecordDto,
  ) {
    const {apiClientService: {trackerService}} = this;

    await trackerService.trackView(data);
    res.json(
      {
        ok: true,
      },
    );
  }
  /* eslint-enable @typescript-eslint/indent */
}
