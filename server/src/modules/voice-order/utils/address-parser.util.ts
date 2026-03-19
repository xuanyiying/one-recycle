import { Injectable, Logger } from '@nestjs/common';

export interface ParsedAddress {
  province?: string;
  city?: string;
  district?: string;
  town?: string;
  street?: string;
  detail?: string;
}

@Injectable()
export class AddressParser {
  private readonly logger = new Logger(AddressParser.name);

  // 省市区数据（简化版，实际应该从数据库或文件加载）
  private readonly provinces = [
    '北京',
    '上海',
    '广东',
    '江苏',
    '浙江',
    '四川',
    '湖北',
    '湖南',
    '河北',
    '河南',
    '山东',
    '山西',
    '陕西',
    '安徽',
    '江西',
    '福建',
    '云南',
    '贵州',
    '广西',
    '海南',
    '甘肃',
    '青海',
    '宁夏',
    '新疆',
    '内蒙古',
    '黑龙江',
    '吉林',
    '辽宁',
    '天津',
    '重庆',
  ];

  private readonly cities: Record<string, string[]> = {
    广东: ['广州', '深圳', '东莞', '佛山', '珠海', '中山'],
    江苏: ['南京', '苏州', '无锡', '常州', '南通', '徐州'],
    浙江: ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴'],
    四川: ['成都', '绵阳', '德阳', '宜宾', '乐山', '泸州'],
    湖北: ['武汉', '宜昌', '襄阳', '荆州', '荆门', '孝感'],
    湖南: ['长沙', '株洲', '湘潭', '衡阳', '岳阳', '常德'],
  };

  private readonly districts: Record<string, string[]> = {
    北京: ['朝阳', '海淀', '西城', '东城', '丰台', '石景山', '通州', '顺义'],
    上海: ['浦东', '黄浦', '徐汇', '长宁', '静安', '普陀', '虹口', '杨浦'],
    广州: ['天河', '越秀', '海珠', '荔湾', '白云', '黄埔', '番禺', '花都'],
    深圳: ['福田', '罗湖', '南山', '宝安', '龙岗', '盐田', '光明', '坪山'],
    成都: ['锦江', '青羊', '金牛', '武侯', '成华', '龙泉驿', '青白江'],
    武汉: ['武昌', '汉口', '汉阳', '青山', '洪山', '东西湖', '江夏'],
  };

  /**
   * 解析地址文本
   */
  async parse(text: string): Promise<ParsedAddress> {
    const address: ParsedAddress = {};

    // 1. 提取省份
    for (const province of this.provinces) {
      if (text.includes(province)) {
        address.province = province;
        break;
      }
    }

    // 2. 提取城市
    if (address.province && this.cities[address.province]) {
      for (const city of this.cities[address.province]) {
        if (text.includes(city)) {
          address.city = city;
          break;
        }
      }
    }

    // 3. 提取区县
    const cityToSearch = address.city || address.province;
    if (cityToSearch && this.districts[cityToSearch]) {
      for (const district of this.districts[cityToSearch]) {
        if (text.includes(district)) {
          address.district = district;
          break;
        }
      }
    }

    // 4. 提取乡镇/街道
    const townPatterns = [
      /([^\s]+) 镇/,
      /([^\s]+) 乡/,
      /([^\s]+) 街道/,
      /([^\s]+) 路/,
    ];
    for (const pattern of townPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        address.town = match[1];
        break;
      }
    }

    // 5. 提取详细地址
    const detailKeywords = [
      '小区',
      '号楼',
      '单元',
      '室',
      '户',
      '号',
      '栋',
      '楼',
    ];
    let detailStart = text.length;

    for (const keyword of detailKeywords) {
      const index = text.indexOf(keyword);
      if (index !== -1 && index < detailStart) {
        detailStart = index;
      }
    }

    if (detailStart < text.length) {
      // 从关键词往前找一段作为详细地址
      const start = Math.max(0, detailStart - 20);
      address.detail = text.substring(start).trim();

      // 清理详细地址中的省市区信息
      if (address.province)
        address.detail = address.detail.replace(address.province, '');
      if (address.city)
        address.detail = address.detail.replace(address.city, '');
      if (address.district)
        address.detail = address.detail.replace(address.district, '');
    } else {
      // 如果没有关键词，取最后一段作为详细地址
      const parts = text.split(/[省市区县]/);
      if (parts.length > 0) {
        address.detail = parts[parts.length - 1].trim();
      }
    }

    this.logger.debug(`Parsed address: ${JSON.stringify(address)}`);
    return address;
  }

  /**
   * 验证地址完整性
   */
  validate(address: ParsedAddress): {
    isValid: boolean;
    missingFields: string[];
  } {
    const missingFields: string[] = [];

    if (!address.province) missingFields.push('省份');
    if (!address.city) missingFields.push('城市');
    if (!address.district) missingFields.push('区县');
    if (!address.detail) missingFields.push('详细地址');

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * 格式化地址
   */
  format(address: ParsedAddress): string {
    const parts: string[] = [];

    if (address.province) parts.push(address.province);
    if (address.city) parts.push(address.city);
    if (address.district) parts.push(address.district);
    if (address.town) parts.push(address.town);
    if (address.detail) parts.push(address.detail);

    return parts.join('');
  }
}
