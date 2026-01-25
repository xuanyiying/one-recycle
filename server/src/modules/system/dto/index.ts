import { ApiProperty } from '@nestjs/swagger';

export class BannerResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  subtitle?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  image: string;

  @ApiProperty({ required: false })
  link?: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ArticleResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  summary: string;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty({ required: false })
  author?: string;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  publishedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
