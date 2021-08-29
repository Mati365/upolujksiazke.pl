import {Module} from '@nestjs/common';
import {BookVolumeService} from './BookVolume.service';

@Module(
  {
    providers: [
      BookVolumeService,
    ],
    exports: [
      BookVolumeService,
    ],
  },
)
export class BookVolumeModule {}
