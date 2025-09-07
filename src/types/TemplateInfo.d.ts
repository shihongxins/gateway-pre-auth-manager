import { FileInfo } from './FileInfo';

/**
 * 模板信息
 */
export interface TemplateInfo {
  /** 主键 */
  id: number;
  /** 唯一标识 */
  uuid: string;
  /** 模板组id */
  group_id: number;
  /** 模板名称 */
  template_name: string;
  /** 预览地址 */
  template_link?: string;
  /** 轮播视频 */
  video_list?: FileInfo[];
  /** 轮播图片 */
  picture_list?: FileInfo[];
  /** 页面标题 */
  page_title: string;
  /** 头像 */
  head_picture: FileInfo;
  /** 联系人 */
  contact: string;
  /** 介绍 */
  introduction: string;
  /** 页面等待时间 秒 */
  wait_time: number;
  /** 授权成功跳转链接 */
  auth_success_link: string;
  /** 创建时间 */
  create_at?: string;
  /** 更新时间 */
  update_at?: string;
}
