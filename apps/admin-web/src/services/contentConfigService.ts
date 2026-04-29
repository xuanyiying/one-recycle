import { apiClient } from './apiClient';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecycleRule {
  id: string;
  category: string;
  title: string;
  content: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  extra?: {
    tags?: string[];
    tagType?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFAQDto {
  question: string;
  answer: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateFAQDto {
  question?: string;
  answer?: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateRecycleRuleDto {
  category: string;
  title: string;
  content: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  extra?: Record<string, any>;
}

export interface UpdateRecycleRuleDto {
  category?: string;
  title?: string;
  content?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  extra?: Record<string, any>;
}

export interface QueryFAQDto {
  category?: string;
  isActive?: boolean;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface QueryRecycleRuleDto {
  category?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const FAQCategoryMap: Record<string, { text: string; color: string }> = {
  SERVICE: { text: '服务相关', color: 'blue' },
  PAYMENT: { text: '支付相关', color: 'orange' },
  CATEGORY: { text: '物品分类', color: 'purple' },
  POINTS: { text: '积分相关', color: 'yellow' },
  ACCOUNT: { text: '账户相关', color: 'cyan' },
  GENERAL: { text: '通用问题', color: 'default' },
};

export const RecycleRuleCategoryMap: Record<string, { text: string; color: string }> = {
  SERVICE_TYPE: { text: '服务类型', color: 'green' },
  SERVICE_SCOPE: { text: '服务范围', color: 'blue' },
  PROCESS: { text: '操作流程', color: 'orange' },
  STANDARD: { text: '回收标准', color: 'purple' },
  POINTS_RULE: { text: '积分规则', color: 'yellow' },
  NOTICE: { text: '注意事项', color: 'red' },
};

export const contentConfigService = {
  // FAQ 相关
  async getFAQs(params?: QueryFAQDto) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
    if (params?.keyword) searchParams.append('keyword', params.keyword);
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.pageSize) searchParams.append('pageSize', String(params.pageSize));

    return await apiClient.get(`/content-config/admin/faqs?${searchParams.toString()}`);
  },

  async getFAQ(id: string) {
    return await apiClient.get(`/content-config/admin/faqs/${id}`);
  },

  async createFAQ(data: CreateFAQDto) {
    return await apiClient.post('/content-config/admin/faqs', data);
  },

  async updateFAQ(id: string, data: UpdateFAQDto) {
    return await apiClient.put(`/content-config/admin/faqs/${id}`, data);
  },

  async deleteFAQ(id: string) {
    return await apiClient.delete(`/content-config/admin/faqs/${id}`);
  },

  // 回收规则相关
  async getRecycleRules(params?: QueryRecycleRuleDto) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.pageSize) searchParams.append('pageSize', String(params.pageSize));

    return await apiClient.get(`/content-config/admin/recycle-rules?${searchParams.toString()}`);
  },

  async getRecycleRule(id: string) {
    return await apiClient.get(`/content-config/admin/recycle-rules/${id}`);
  },

  async createRecycleRule(data: CreateRecycleRuleDto) {
    return await apiClient.post('/content-config/admin/recycle-rules', data);
  },

  async updateRecycleRule(id: string, data: UpdateRecycleRuleDto) {
    return await apiClient.put(`/content-config/admin/recycle-rules/${id}`, data);
  },

  async deleteRecycleRule(id: string) {
    return await apiClient.delete(`/content-config/admin/recycle-rules/${id}`);
  },
};
