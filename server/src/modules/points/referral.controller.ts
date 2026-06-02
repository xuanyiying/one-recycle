import { Public } from '@/common/decorators/auth.decorator';
import { Controller, Get, Query } from '@nestjs/common';
import { InviteService } from './services/invite.service';

@Controller('referral')
export class ReferralController {
  constructor(private readonly inviteService: InviteService) {}

  @Public()
  @Get('qrcode')
  async getQRCode(@Query('userId') userId: string) {
    if (!userId) {
      return { success: false, message: 'userId is required' };
    }

    try {
      const qrCodeUrl = await this.inviteService.generateReferralQRCode(
        BigInt(userId),
      );
      return { success: true, data: { url: qrCodeUrl } };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to generate QR code',
      };
    }
  }
}
