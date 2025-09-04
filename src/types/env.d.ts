/**
 * @interface ImportMetaEnv
 * @property {string} VITE_API_BASE_URL - 请求接口地址
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // 可以添加其他环境变量
  [key: string]: any;
}

/**
 * @interface ImportMeta
 * @property {ImportMetaEnv} env - 环境变量
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
