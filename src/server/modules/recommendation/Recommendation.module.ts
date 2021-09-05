import {Global, Module} from '@nestjs/common';
import {BookRecommendationModule} from './modules';

@Global()
@Module(
  {
    imports: [
      BookRecommendationModule,
    ],
    exports: [
      BookRecommendationModule,
    ],
  },
)
export class RecommendationModule {}
