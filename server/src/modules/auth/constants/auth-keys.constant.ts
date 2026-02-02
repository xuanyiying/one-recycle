/**
 * Authentication Redis Key Constants and Generators
 * 统一管理所有认证相关的Redis键名，避免硬编码
 */

export enum AuthKeyPrefix {
  VERIFICATION_CODE = 'auth:code:',
  REFRESH_TOKEN = 'auth:refresh:',
  SESSION = 'auth:session:',
  ROLE_PERMISSIONS = 'auth:permissions:role:',
}

export class AuthKeyUtils {
  /**
   * 生成角色权限Redis键
   * @param roleId 角色ID
   * @returns auth:permissions:role:{roleId}
   */
  static getRolePermissionsKey(roleId: number | string): string {
    return `${AuthKeyPrefix.ROLE_PERMISSIONS}${roleId}`;
  }

  /**
   * 生成验证码Redis键
   * @param mobile 手机号
   * @returns auth:code:{mobile}
   */
  static getVerificationCodeKey(mobile: string): string {
    return `${AuthKeyPrefix.VERIFICATION_CODE}${mobile}`;
  }

  /**
   * 生成刷新令牌Redis键
   * @param token 刷新令牌
   * @returns auth:refresh:{token}
   */
  static getRefreshTokenKey(token: string): string {
    return `${AuthKeyPrefix.REFRESH_TOKEN}${token}`;
  }

  /**
   * 生成会话Redis键
   * @param sessionId 会话ID
   * @returns auth:session:{sessionId}
   */
  static getSessionKey(sessionId: string): string {
    return `${AuthKeyPrefix.SESSION}${sessionId}`;
  }
}
