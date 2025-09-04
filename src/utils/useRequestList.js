import { reactive, ref } from 'vue';

const defaultParams = {
  keyword: '',
  page: 1,
  page_size: 10,
};

/**
 * @description 分页列表请求
 * @template T
 * @param {() => Promise<(import('../types/Request').RequestResponse<T[]>)|any>} effect 分页列表请求函数
 * @param {Record<string, any>} additionalParams 额外参数
 */
export function useRequestList(effect, additionalParams = {}) {
  /**
   * @type {import('vue').Reactive<import('../types/Request').RequestParams & Record<string, any>>}
   */
  const params = reactive({ ...defaultParams, ...additionalParams });
  /**
   * @type {import('vue').Ref<T[]>}
   */
  const list = ref([]);
  const total = ref(0);
  const loading = ref(false);
  const selected = ref([]);
  /**
   * @description 重置参数
   */
  function reset() {
    Object.assign(params, defaultParams, additionalParams);
  }
  /**
   * @description 搜索
   * @param {string|void} p 搜索关键词
   */
  function search(p) {
    if (loading.value) return;
    params.page = 1;
    if (typeof p === 'string') {
      params.keyword = p;
    }
    return effect();
  }
  /**
   * @description 重置搜索
   */
  function resetSearch() {
    reset();
    return search();
  }
  /**
   * @description 搜索或重新加载
   * @param {string|void} p 搜索关键词
   */
  function searchOrReload(p) {
    if (typeof p === 'string') {
      if (params.keyword !== p) {
        params.keyword = p;
        params.page = 1;
      }
    }
    return effect();
  }
  /**
   * @description 分页改变
   * @param {number|void} page 页码
   */
  function pageChange(page = 1) {
    page = +page * 1;
    params.page = page && page > 0 ? page : 1;
    return effect();
  }
  /**
   * @description 分页大小改变
   * @param {number|void} pageSize 分页大小
   */
  function pageSizeChange(pageSize = 10) {
    pageSize = +pageSize * 1;
    params.page_size = pageSize && pageSize > 0 ? pageSize : 10;
    return pageChange(1);
  }
  /**
   * @typedef {object} PageInfoConfig
   * @property {string} [pageKey='page'] 分页键
   * @property {string} [pageValueKey='page'] 分页值键
   * @property {string} [pageSizeKey='pageSize'] 分页大小键
   * @property {string} [pageSizeValueKey='pageSize'] 分页大小值键
   * @property {string} [totalKey='total'] 总数键
   * @property {string} [totalValueKey='total'] 总数值键
   * @param {PageInfoConfig & Record<any, any>} config
   * @returns {import('vue').ComputedRef<any>}
   */
  function getPageInfoByConfigFromParams(config) {
    const pageInfo = computed(() => ({
      ...config,
      [config.pageKey]: params[config.pageKey] || 1,
      [config.pageSizeKey]: params[config.pageSizeKey] || 10,
      [config.totalKey]: total.value || 0,
    }));
    return pageInfo;
  }
  /**
   * @description 分页信息改变
   * @param {Record<string, number>|any} info 分页信息
   */
  function pageInfoChange(info) {
    let page = params.page,
      pageSize = params.page_size;
    if (info.current || info.page) {
      page = (+info.current || +info.page) * 1;
      page = page && page > 0 ? page : params.page;
    }
    if (info.pageSize || info.page_size) {
      pageSize = (+info.pageSize || +info.page_size) * 1;
      pageSize = pageSize && pageSize > 0 ? pageSize : params.page_size;
    }
    if (page !== params.page) {
      return pageChange(page);
    }
    if (pageSize !== params.page_size) {
      return pageSizeChange(pageSize);
    }
  }
  /**
   * @description 选择改变
   * @param {*} currentSelected 选择项
   */
  function selectChange(currentSelected = []) {
    selected.value = currentSelected;
  }
  return {
    params,
    list,
    total,
    loading,
    selected,
    reset,
    search,
    resetSearch,
    searchOrReload,
    pageChange,
    pageSizeChange,
    getPageInfoByConfigFromParams,
    pageInfoChange,
    selectChange,
  };
}
