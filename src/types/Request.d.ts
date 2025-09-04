/**
 * 请求参数
 */
export interface RequestParams {
  /** 搜索关键词 */
  keyword: string;
  /** 页码 */
  page: number;
  /** 每页数量 */
  page_size: number;
  /** 其他参数 */
  [key: string]: any;
}

/**
 * 请求响应
 */
export interface RequestResponse<T> {
  /** 状态码 */
  code: number;
  /** 消息 */
  msg: string;
  /** 数据 */
  data: T extends Array<any> ? { list: T; total: number } : T;
}
