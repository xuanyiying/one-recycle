import  { get, post } from '@/utils/request';

export interface InviteRecord {
  id: number;
  inviterId: number;
  inviteeId: number;
  rewardPoints: number;
  totalOrderRewards: number;
  totalOrders: number;
  totalItems: number;
  createdAt: string;
  invitee: {
    id: number;
    nickname: string;
    avatarUrl: string;
  };
  hasOrdered: boolean;
  lastOrderAt: string | null;
}

export interface InviteStats {
  inviteCode: string;
  totalInvites: number;
  totalRewards: number;
  totalItems: number;
  totalOrders: number;
  recentInvites: InviteRecord[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getInviteStats = () => {
  return get('/points/invite/stats');
};

export const getInviteList = (page = 1, limit = 20) => {
  return get('/points/invite/list', { page, limit });
};

export const bindInvite = (inviteCode: string) => {
  return post('/points/invite/bind', { inviteCode });
};

export const getReferralQRCode = (userId: string) => {
  return get('/referral/qrcode', { userId });
};

export default {
  getInviteStats,
  getInviteList,
  bindInvite,
  getReferralQRCode,
};
