import {CreateBrandDto} from '@server/modules/brand/dto/CreateBrand.dto';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from './DefaultWebsiteScrappersGroup';

type BrandBasicInfo = {
  name: string;
};

type BrandScrapperGroupInitializer = DefaultScrappersGroupConfig & {
  brand: BrandBasicInfo,
};

export class BrandScrappersGroup extends DefaultWebsiteScrappersGroup {
  private readonly brand: BrandBasicInfo;

  constructor(
    {
      brand,
      ...attrs
    }: BrandScrapperGroupInitializer,
  ) {
    super(attrs);
    this.brand = brand;
  }

  getBrandDTO() {
    return new CreateBrandDto(this.brand);
  }
}
