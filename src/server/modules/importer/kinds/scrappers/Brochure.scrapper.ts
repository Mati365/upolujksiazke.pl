import {CreateBrochureDto} from '@server/modules/brochure/dto/CreateBrochure.dto';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';
import {WebsiteScrapperItemInfo} from '../../modules/scrapper/service/shared';

export type BrochureScrapperInfo = WebsiteScrapperItemInfo<CreateBrochureDto> & {
  kind: ScrapperMetadataKind.BROCHURE,
};
