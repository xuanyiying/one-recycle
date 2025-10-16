import { TemplateType } from '../entities/notification.entity';

export class CreateTemplateDto {
  name: string;
  type: TemplateType;
  subject?: string;
  content: string;
  variables: string[];
}