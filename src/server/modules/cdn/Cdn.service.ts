import {Inject, Injectable} from '@nestjs/common';

export const CDN_OPTIONS = 'CDN_OPTIONS';

export type CdnServiceOptions = {
  uploadRootDir: string,
};

@Injectable()
export class CdnService {
  constructor(
    @Inject(CDN_OPTIONS) private readonly options: CdnServiceOptions,
  ) {}
}
