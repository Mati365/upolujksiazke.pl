import {Inject, Injectable, Logger} from '@nestjs/common';
import {EntityManager} from 'typeorm';
import chalk from 'chalk';
import sequential from 'promise-sequential';
import {convert, IInfoResult, resize} from 'easyimage';
import * as path from 'path';
import * as mime from 'mime-types';
import * as R from 'ramda';
import mkdirp from 'mkdirp';

import {
  downloadFile,
  isImageMimeType,
} from '@server/common/helpers';

import {Size} from '@shared/types';
import {InterceptMethod} from '@shared/helpers/decorators/InterceptMethod';
import {
  EnterTmpFolderScope,
  TmpDirService,
  TmpFolderScopeAttrs,
} from '../../tmp-dir';

import {
  AttachmentService,
  AttachmentServiceOptions,
  ATTACHMENTS_OPTIONS,
} from './Attachment.service';

import {ImageAttachmentEntity, ImageVersion} from '../entity/ImageAttachment.entity';
import {
  UploadedFileDto,
  CreateImageAttachmentDto,
} from '../dto';

export type ImageResizeConfig = Record<ImageVersion, Size>;

export type ImageResizedEntities = Record<ImageVersion, ImageAttachmentEntity>;

export type ImageFetcherAttrs = {
  dto: CreateImageAttachmentDto,
  sizes: Partial<ImageResizeConfig>,
  destSubDir?: string,
  extension?: string,
};

@Injectable()
export class ImageAttachmentService {
  private logger = new Logger(ImageAttachmentService.name);

  constructor(
    @Inject(ATTACHMENTS_OPTIONS) private readonly options: AttachmentServiceOptions,
    private readonly attachmentService: AttachmentService,
    private readonly tmpDirService: TmpDirService,
  ) {}

  /**
   * Create single attachment
   *
   * @param {CreateImageAttachmentDto} dto
   * @param {EntityManager} [entityManager]
   * @returns {Promise<ImageAttachmentEntity>}
   * @memberof ImageAttachmentService
   */
  async create(
    {nsfw, ratio, version, ...attachment}: CreateImageAttachmentDto,
    entityManager: EntityManager = <any> ImageAttachmentEntity,
  ): Promise<ImageAttachmentEntity> {
    const {attachmentService} = this;

    return entityManager.save(
      ImageAttachmentEntity.create(
        {
          nsfw,
          ratio,
          version,
          attachment: await attachmentService.create(attachment, entityManager),
        },
      ),
    );
  }

  /**
   * Fetches and creates multiple versions of attachment
   *
   * @memberof ImageAttachmentService
   */
  @EnterTmpFolderScope(
    function tmpFolderConfig() {
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
      entityManager: EntityManager,
      {
        tmpFolderPath,
      }: TmpFolderScopeAttrs,
    ) {
      this.logger.log(`Fetching ${chalk.bold(dto.originalUrl)} to ${chalk.bold(tmpFolderPath)} tmp folder!`);
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

    const resizedFiles = await Promise.all(
      R.toPairs(sizes).map(
        async ([version, size]): Promise<[ImageVersion, {fileName: string, resizedFile: IInfoResult}]> => {
          const fileName = path.join(
            destSubDir,
            fileNameGenerator(extension),
          );

          const resizedFile = await resize(
            {
              src: convertResult.path,
              dst: path.resolve(dest, fileName),
              width: size.w,
              height: size.h,
            },
          );

          return [
            <ImageVersion> version,
            {
              fileName,
              resizedFile,
            },
          ];
        },
      ),
    );

    const sequenceResult = await sequential(
      R.map(
        ([version, {fileName, resizedFile}]) => async () => [[
          version,
          await this.create(
            new CreateImageAttachmentDto(
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
            ),
            entityManager,
          ),
        ]],
        resizedFiles,
      ) as any,
    );

    return R.fromPairs(sequenceResult) as ImageResizedEntities;
  }
}
