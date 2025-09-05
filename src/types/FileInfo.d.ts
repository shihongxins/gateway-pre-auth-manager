/**
 * 文件信息
 */
export interface FileInfo {
  /** 主键 */
  id: number;
  /** 唯一标识 */
  uuid: string;
  /** 路径 */
  path: string;
  /** 文件名 */
  file_name: string;
  /** 文件类型 1: 图片 2: 视频 */
  file_type: number;
  /** 创建时间 */
  create_at?: string;
  /** 更新时间 */
  update_at?: string;
  /** 文件 */
  files?: File;
}
