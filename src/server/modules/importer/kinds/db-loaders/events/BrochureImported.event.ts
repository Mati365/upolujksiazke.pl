import {BrochureEntity} from '@server/modules/brochure/entity/Brochure.entity';
import {CreateBrochureDto} from '@server/modules/brochure/dto/CreateBrochure.dto';

export class BrochureImportedEvent {
  constructor(
    public readonly brochure: BrochureEntity,
    public readonly dto: CreateBrochureDto,
  ) {}
}
