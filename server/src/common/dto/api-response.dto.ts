import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 统一 API 响应 DTO
 */
export class ApiResponseDto<T> {
  @ApiProperty({ description: '是否成功' })
  success: boolean;

  @ApiPropertyOptional({ description: '响应消息' })
  message?: string;

  @ApiPropertyOptional({ description: '响应数据' })
  data?: T;

  @ApiPropertyOptional({ description: '错误信息' })
  error?: {
    code: string;
    message: string;
    details?: any;
  };

  @ApiProperty({ description: '时间戳' })
  timestamp: string;
}

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
): ApiResponseDto<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
): ApiResponseDto<null> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}
