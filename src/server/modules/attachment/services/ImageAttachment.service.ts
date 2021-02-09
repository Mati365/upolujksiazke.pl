import {Inject, Injectable, Logger} from '@nestjs/common';
import {EntityManager} from 'typeorm';
import chalk from 'chalk';
import {convert, resize} from 'easyimage';
import * as path from 'path';
import * as mime from 'mime-types';
import * as R from 'ramda';
import mkdirp from 'mkdirp';

import {checkIfExists, runInPostHookIfPresent} from '@server/common/helpers/db';
import {safeArray, mapObjValuesToPromise} from '@shared/helpers';
import {
  downloadFile,
  isImageMimeType,
} from '@server/common/helpers';

import {CanBeArray, ID, Size} from '@shared/types';
import {InterceptMethod} from '@shared/helpers/decorators/InterceptMethod';
import {
  EnterTmpFolderScope,
  TmpDirService,
  TmpFolderScopeAttrs,
} from '../../tmp-dir';

import {
  AttachmentServiceOptions,
  ATTACHMENTS_OPTIONS,
} from './Attachment.service';

import {
  ImageAttachmentEntity,
  ImageVersion,
} from '../entity/ImageAttachment.entity';

import {
  UploadedFileDto,
  CreateImageAttachmentDto,
} from '../dto';

export type ImageResizeConfig = Partial<Record<ImageVersion, Size>>;

export type ImageResizedEntities = Record<ImageVersion, ImageAttachmentEntity>;

export type ImageFetcherAttrs = {
  dto: CreateImageAttachmentDto,
  sizes: Partial<ImageResizeConfig>,
  destSubDir?: string,
  extension?: string,
};

@Injectable()
export class ImageAttachmentService {
  private readonly logger = new Logger(ImageAttachmentService.name);

  constructor(
    @Inject(ATTACHMENTS_OPTIONS) private readonly options: AttachmentServiceOptions,
    private readonly tmpDirService: TmpDirService,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Fetches and upserts image into many to many table
   *
   * @param {Object}
   * @returns
   * @memberof ImageAttachmentService
   */
  async upsertImage<EntityType extends {id: any}>(
    {
      entityManager,
      entity,
      resourceColName,
      manyToMany,
      fetcher,
      image,
      upsertResources,
    }: {
      entityManager: EntityManager,
      entity: EntityType,
      resourceColName?: keyof EntityType,
      image: CreateImageAttachmentDto,
      manyToMany: {
        tableName: string,
        idEntityColName: string,
      },

      fetcher: Omit<ImageFetcherAttrs, 'dto'>,
      upsertResources: boolean,
    },
  ) {
    await runInPostHookIfPresent(
      {
        transactionManager: entityManager,
      },
      async (hookEntityManager) => {
        const fetchResource = async () => R.values(
          await this.fetchAndCreateScaled(
            {
              ...fetcher,
              dto: image,
            },
            hookEntityManager,
          ),
        );

        if (upsertResources) {
          entity[<string> resourceColName] = await fetchResource();

          await hookEntityManager.save(
            new (entity as any).constructor(
              {
                id: entity.id,
                [resourceColName]: entity[resourceColName],
              },
            ),
          );
        } else {
          const shouldFetchCover = !!image?.originalUrl && !(await checkIfExists(
            {
              entityManager: this.entityManager,
              tableName: manyToMany.tableName,
              where: {
                [manyToMany.idEntityColName]: entity.id,
              },
            },
          ));

          if (!shouldFetchCover)
            return;

          const images = await fetchResource();
          entity[<string> resourceColName] = images;

          await this.directInsertToTable(
            {
              entityManager: hookEntityManager,
              coverTableName: manyToMany.tableName,
              images,
              fields: {
                [manyToMany.idEntityColName]: entity.id,
              },
            },
          );
        }
      },
    );
  }

  /**
   * Skips image attachment select in many to many relations
   *
   * @param {Object} attr
   * @memberof ImageAttachmentService
   */
  async directInsertToTable(
    {
      coverTableName,
      images,
      fields,
      entityManager = this.entityManager,
    }: {
      entityManager?: EntityManager,
      images: {id: ID}[],
      coverTableName: string,
      fields: object,
    },
  ) {
    await (
      entityManager
        .createQueryBuilder()
        .insert()
        .into(coverTableName, [...R.keys(fields), 'imageAttachmentsId'])
        .values(
          images.map(
            (imgAttachment) => ({
              ...fields,
              imageAttachmentsId: imgAttachment.id,
            }),
          ),
        )
        .execute()
    );
  }

  /**
   * Remove single image attachment
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager=this.entityManager]
   * @memberof ImageAttachmentService
   */
  async delete(ids: number[], entityManager: EntityManager = this.entityManager) {
    const imageAttachments = await ImageAttachmentEntity.findByIds(
      ids,
      {
        select: ['id'],
        relations: ['attachment'],
      },
    );

    await entityManager.remove(
      [
        ...imageAttachments,
        ...R.pluck('attachment', imageAttachments),
      ],
    );
  }

  /**
   * Creates single or multiple entities
   *
   * @param {CreateImageAttachmentDto} dto
   * @param {EntityManager} [entityManager]
   * @returns {Promise<ImageAttachmentEntity>}
   * @memberof ImageAttachmentService
   */
  async create(dto: CreateImageAttachmentDto, entityManager?: EntityManager): Promise<ImageAttachmentEntity>;
  async create(dto: CreateImageAttachmentDto[], entityManager?: EntityManager): Promise<ImageAttachmentEntity[]>;
  async create(
    dto: CanBeArray<CreateImageAttachmentDto>,
    entityManager: EntityManager = <any> ImageAttachmentEntity,
  ): Promise<CanBeArray<ImageAttachmentEntity>> {
    if (R.is(Array, dto)) {
      return entityManager.save(
        safeArray(dto).map((item) => ImageAttachmentEntity.fromDTO(item)),
      );
    }

    return entityManager.save(
      ImageAttachmentEntity.fromDTO(<CreateImageAttachmentDto> dto),
    );
  }

  /**
   * Fetches and creates multiple versions of attachment
   *
   * @memberof ImageAttachmentService
   */
  @EnterTmpFolderScope(
    function tmpFolderConfig(this: ImageAttachmentService) {
      return {
        dirService: this.tmpDirService,
        attrs: {
          deleteOnExit: true,
        },
      };
    },
  )
  @InterceptMethod(
    function loggerWrapper(
      this: ImageAttachmentService,
      {dto}: ImageFetcherAttrs,
      _: EntityManager,
      {
        tmpFolderPath,
      }: TmpFolderScopeAttrs,
    ) {
      const {logger} = this;

      if (dto.originalUrl)
        logger.log(`Fetching ${chalk.bold(dto.originalUrl)} to ${chalk.bold(tmpFolderPath)} tmp folder!`);
    },
  )
  async fetchAndCreateScaled(
    {
      extension = 'webp',
      destSubDir = '/',
      dto,
      sizes,
    }: ImageFetcherAttrs,
    entityManager?: EntityManager,
    {
      tmpFolderPath,
    }: TmpFolderScopeAttrs = null,
  ): Promise<ImageResizedEntities> {
    const {
      options: {
        dest,
        fileNameGenerator,
      },
    } = this;

    const {originalUrl} = dto;
    if (!originalUrl)
      return null;

    const resultFile = await downloadFile(
      {
        url: originalUrl,
        outputPath: path.join(tmpFolderPath, `source${path.extname(originalUrl)}`),
        headerValidatorFn: ({size: {kilobytes}, type}) => (
          kilobytes < 2_000 && isImageMimeType(type)
        ),
      },
    );

    if (!resultFile)
      throw new Error('Fetched file is not present!');

    const convertResult = await convert(
      {
        src: resultFile.outputPath,
        dst: path.join(tmpFolderPath, `dest.${extension}`),
      },
    );

    // parallel resize files
    await mkdirp(
      path.join(dest, destSubDir),
    );

    const dtos = R.values(
      await mapObjValuesToPromise(
        async (size, version: ImageVersion): Promise<CreateImageAttachmentDto> => {
          const fileName = path.join(
            destSubDir,
            fileNameGenerator(extension),
          );

          const resizedFile = await resize(
            {
              src: convertResult.path,
              dst: path.resolve(dest, fileName),
              width: size.w,
              ...size.h && {
                height: size.h,
              },
            },
          );

          return new CreateImageAttachmentDto(
            {
              version,
              originalUrl,
              name: dto.name,
              nsfw: dto.nsfw || false,
              ratio: resizedFile.width / resizedFile.height,
              file: new UploadedFileDto(
                {
                  mimetype: mime.lookup(extension) || null,
                  size: resizedFile.size,
                  file: fileName,
                },
              ),
            },
          );
        },
        sizes,
      ),
    );

    const entities = await this.create(dtos, entityManager);
    return <ImageResizedEntities> R.mapObjIndexed(
      R.nth(0),
      R.groupBy(R.prop('version'), entities),
    );
  }
}
