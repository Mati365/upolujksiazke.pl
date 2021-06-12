import {IsOptional, IsString} from 'class-validator';
import {APIPaginationDto} from './APIPagination.dto';

export class APIBasicPaginationFilters extends APIPaginationDto {
  @IsOptional()
  @IsString()
  readonly phrase: string;
}
