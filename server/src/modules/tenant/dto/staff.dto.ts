export class StaffResponseDto {
  id: string;
  username: string;
  realName?: string;
  mobile?: string;
  email?: string;
  avatarUrl?: string;
  tenantId: string;
  role: {
    id: number;
    name: string;
    code: string;
    isAdmin: boolean;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export class StaffLoginResultDto {
  staff: StaffResponseDto;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
