import {Global, Module} from '@nestjs/common';
import {ElasticsearchModule} from '@nestjs/elasticsearch';

import {SERVER_ENV} from '@server/constants/env';

@Global()
@Module(
  {
    imports: [
      ElasticsearchModule.register(
        {
          node: SERVER_ENV.elasticsearchConfig.node,
        },
      ),
    ],
    exports: [
      ElasticsearchModule,
    ],
  },
)
export class ElasticsearchConnectionModule {}
