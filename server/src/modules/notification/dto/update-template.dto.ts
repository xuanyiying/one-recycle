export class UpdateTemplateDto {
  name?: string;
  subject?: string;
  content?: string;
  variables?: string[];
  isActive?: boolean;
  smsTemplateCode?: string;
  wechatTemplateId?: string;
}
