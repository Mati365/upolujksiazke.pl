import {Injectable} from '@nestjs/common';
import {Connection} from 'typeorm';

import {runTransactionWithPostHooks} from '@server/common/helpers/db';

import {CreateBrochureDto} from '../dto/CreateBrochure.dto';
import {BrochureEntity} from '../entity/Brochure.entity';
import {BrochurePageService} from '../modules/brochure-page/BrochurePage.service';
import {CreateBrochurePageDto} from '../modules/brochure-page/dto/BrochurePage.dto';

@Injectable()
export class BrochureService {
  constructor(
    private readonly connection: Connection,
    private readonly pageService: BrochurePageService,
  ) {}

  /**
   * Creates brochure record
   *
   * @param {CreateBrochureDto} dto
   * @return {Promise<BrochureEntity>}
   * @memberof BrochureService
   */
  async create({pages, ...dto}: CreateBrochureDto): Promise<BrochureEntity> {
    const {
      connection,
      pageService,
    } = this;

    if (!pages?.length)
      return null;

    return runTransactionWithPostHooks(connection, async (transaction) => {
      const brochure = await transaction.save(
        new BrochureEntity(dto),
      );

      await pageService.upsertList(
        pages.map((pageDto) => new CreateBrochurePageDto(
          {
            ...pageDto,
            brochureId: brochure.id,
          },
        )),
      );

      return brochure;
    });
  }
}
