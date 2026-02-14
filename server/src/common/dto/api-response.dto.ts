import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({ description: '错误代码' })
  code: string;

  @ApiProperty({ description: '错误消息' })
  message: string;

  @ApiPropertyOptional({ description: '错误详情' })
  details?: any;
}

export class ApiResponseDto<T> {
  @ApiProperty({ description: '是否成功' })
  success: boolean;

  @ApiPropertyOptional({ description: '响应消息' })
  message?: string;

  @ApiPropertyOptional({ description: '响应数据' })
  data?: T;

  @ApiPropertyOptional({ description: '业务状态码' })
  code?: string;

  @ApiProperty({ description: '时间戳' })
  timestamp: string;

  @ApiPropertyOptional({ description: '请求路径' })
  path?: string;

  @ApiPropertyOptional({ description: '错误信息', type: ApiErrorDto })
  error?: ApiErrorDto;
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
): ApiResponseDto<T> {
  return {
    success: true,
    message: message || 'Success',
    code: 'SUCCESS',
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
): ApiResponseDto<null> {
  return {
    success: false,
    code,
    message,
    timestamp: new Date().toISOString(),
    error: {
      code,
      message,
      details,
    },
  };
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PaginatedResponseDto<T> extends ApiResponseDto<PaginatedData<T>> {
  @ApiPropertyOptional({ description: '分页数据' })
  data?: PaginatedData<T>;
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponseDto<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    code: 'SUCCESS',
    message: 'Success',
    data: {
      items,
      total,
      page,
      limit,
      totalPages,
    },
    timestamp: new Date().toISOString(),
  };
}
