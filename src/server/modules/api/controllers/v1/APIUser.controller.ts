import {Controller, Post, Res, Body} from '@nestjs/common';
import {Response} from 'express';

import {Throttle} from '@nestjs/throttler';
import {Accepts} from '@server/common/decorators/Accepts.decorator';
import {APIClientService} from '../../services';
import {RefreshTokenDto} from './dto';

@Controller('users')
export class APIUsersController {
  constructor(
    private readonly apiClientService: APIClientService,
  ) {}

  /**
   * Creates account for anonymous user
   *
   * @todo
   *  Add recaptcha?
   *
   * @param {Response} res
   * @memberof APIUsersController
   */
  @Throttle(1, 240)
  @Accepts('application/json')
  @Post('/register/anonymous')
  async registerAnonymous(@Res() res: Response) {
    const {client: {repo}} = this.apiClientService;

    res.json(
      await repo.users.registerAnonymous(),
    );
  }

  /* eslint-disable @typescript-eslint/indent */
  @Accepts('application/json')
  @Post('/refresh-token')
  async refreshToken(
    @Res() res: Response,
    @Body() {refreshToken}: RefreshTokenDto,
  ) {
    const {client: {repo}} = this.apiClientService;

    res.json(
      await repo.users.refreshToken(refreshToken),
    );
  }
  /* eslint-enable @typescript-eslint/indent */
}
