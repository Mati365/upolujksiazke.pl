import {Injectable, Inject, forwardRef} from '@nestjs/common';
import {EventEmitter2} from 'eventemitter2';
import {plainToClass} from 'class-transformer';

import {safeToString} from '@shared/helpers';
import {
  InlineMetadataObject,
  MetadataDbLoader,
} from '@db-loader/MetadataDbLoader.interface';

import {BrochureService} from '@server/modules/brochure/services/Brochure.service';
import {ScrapperService} from '@scrapper/service/Scrapper.service';
import {CreateBrochureDto} from '@server/modules/brochure/dto/CreateBrochure.dto';
import {BrochureImportedEvent} from './events';

/**
 * Do not exec here whole OCR pipeline etc.
 * It is called every refresh latest brochures!
 *
 * @export
 * @class BrochureDbLoaderService
 * @implements {MetadataDbLoader}
 */
@Injectable()
export class BrochureDbLoaderService implements MetadataDbLoader {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => BrochureService))
    private readonly brochureService: BrochureService,
    private readonly scrapperService: ScrapperService,
  ) {}

  async extractMetadataToDb(metadata: InlineMetadataObject) {
    const {
      eventEmitter,
      brochureService,
      scrapperService,
    } = this;

    const dto = plainToClass(CreateBrochureDto, metadata.content);
    const websiteId = (
      metadata.websiteId
        ?? (await scrapperService.findOrCreateWebsiteByUrl(dto.url))?.id
    );

    const brochureEntity = await brochureService.upsert(
      new CreateBrochureDto(
        {
          ...dto,
          remoteId: safeToString(metadata.remoteId) ?? dto.remoteId,
          websiteId,
        },
      ),
    );

    await eventEmitter.emitAsync(
      'loader.brochure.imported',
      new BrochureImportedEvent(brochureEntity, dto),
    );
  }
}
