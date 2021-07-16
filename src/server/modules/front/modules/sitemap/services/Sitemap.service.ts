import {Injectable} from '@nestjs/common';
import {MeasureCallDuration} from '@server/common/helpers/decorators';

@Injectable()
export class SitemapService {
  @MeasureCallDuration('refreshSitemap')
  async refresh(): Promise<void> {
    return null;
  }
}
