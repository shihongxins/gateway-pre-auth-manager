/**
 * 用户信息
 */
export interface UserInfo {
  /** 主键 */
  id: number;
  /** 唯一标识 */
  uuid: string;
  /** 用户名 */
  username: string;
  /** 姓名 */
  name: string;
  /** 手机号 */
  phone: string;
  /** 邮箱 */
  email: string;
  /** 角色 0: 普通用户 1: 管理员 2:超级管理员 */
  roles: number;
  /** 状态 0: 禁用 1: 启用 */
  is_ok: number;
  /** 创建时间 */
  create_at?: string;
  /** 更新时间 */
  update_at?: string;
}
