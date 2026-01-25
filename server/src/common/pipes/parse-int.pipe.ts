import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

/**
 * 增强的整数解析管道
 * 提供更友好的错误信息
 */
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);

    if (isNaN(val)) {
      throw new BadRequestException(
        `${metadata.data || 'Value'} 必须是有效的整数`,
      );
    }

    return val;
  }
}

/**
 * 正整数解析管道
 */
@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);

    if (isNaN(val) || val <= 0) {
      throw new BadRequestException(`${metadata.data || 'Value'} 必须是正整数`);
    }

    return val;
  }
}
