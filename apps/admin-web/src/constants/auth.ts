export const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'OPERATOR'];

/**
 * 从用户对象中提取角色代码
 * 支持字符串形式 ("ADMIN") 或对象形式 ({ code: "ADMIN" })
 */
export function getRoleCode(user: any): string | null {
  if (!user || !user.role) return null;
  
  if (typeof user.role === 'string') {
    return user.role.toUpperCase();
  }
  
  if (typeof user.role === 'object' && user.role.code) {
    return String(user.role.code).toUpperCase();
  }
  
  return null;
}

/**
 * 检查用户是否有权限访问后台
 */
export function hasAdminPermission(user: any): boolean {
  const roleCode = getRoleCode(user);
  return !!roleCode && ALLOWED_ROLES.includes(roleCode);
}
