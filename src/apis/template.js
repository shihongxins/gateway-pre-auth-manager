import { request } from '../utils/request';

export const templateFieldRules = {
  template_name: [{ required: true, pattren: /^\s*$/, message: '模板名称不能为空' }],
  page_title: [{ required: true, pattren: /^\s*$/, message: '页面标题不能为空' }],
  contact: [
    { required: true, message: '联系人不能为空' },
    {
      validator: (val = '') => {
        if (/^\s*$/.test(val)) {
          return { result: false, message: '联系人不能为空' };
        }
        if (
          !/^(?:(?:\+|00)86)?1\d{10}$/.test(val) &&
          !/^(?:(?:\d{3}-)?\d{8}|^(?:\d{4}-)?\d{7,8})(?:-\d+)?$/.test(val)
        ) {
          return { result: false, message: '请输入正确的手机号或电话号码' };
        }
        return { result: true, message: undefined };
      },
    },
  ],
  introduction: [{ required: true, pattren: /^\s*$/, message: '介绍不能为空' }],
  head_picture: [{ required: true, message: '请上传头像' }],
  wait_time: [
    { required: true, message: '等待时间不能为空' },
    {
      validator: (val = '') => {
        if (!/^\d+$/.test(val) || Number(val) <= 0) {
          return { result: false, message: '请输入正确的等待时间' };
        }
        return { result: true, message: undefined };
      },
    },
  ],
  auth_success_link: [{ required: true, pattren: /^\s*$/, message: '成功跳转不能为空' }],
};

/**
 * 添加模板
 * @param {import("../types/TemplateInfo").TemplateInfo} info
 * @returns {Promise<import("../types/Request").RequestResponse<any>>|Error}
 */
export function addTemplate(info) {
  if (info.video_list.length < 1 && info.picture_list.length < 1) {
    return new Error('请上传轮播图片或视频');
  }
  for (const key in templateFieldRules) {
    const rules = templateFieldRules[key];
    const value = info[key];
    const results = rules.map((rule) => {
      const result = { result: true, message: rule.message, type: rule.type || 'error' };
      if (rule.required && !value) {
        result.result = false;
      }
      if (rule.pattren && !rule.pattren.test(value)) {
        result.result = false;
      }
      if (rule.validator) {
        const valid = rule.validator(value);
        result.result = valid.result || true;
        result.message = valid.message;
      }
      return result;
    });
    const firstFail = results.find((result) => !result.result);
    if (firstFail) {
      return new Error(firstFail.message);
    }
  }
  return request.post('/template/addTemplate', info).then((res) => res.data);
}

/**
 * 删除模板
 * @param {number[]} ids
 * @returns {Promise<import("../types/Request").RequestResponse<any>>|Error}
 */
export function deleteTemplate(ids = []) {
  if (!ids.length) {
    return new Error('文件ID不能为空');
  }
  return request.post('/template/delTemplate', { ids }).then((res) => res.data);
}

/**
 * 修改模板
 * @param {import("../types/TemplateInfo").TemplateInfo} info
 * @returns {Promise<import("../types/Request").RequestResponse<any>>|Error}
 */
export function updateTemplate(info) {
  if (!info.id) {
    return new Error('模板ID不能为空');
  }
  if (info.video_list.length < 1 && info.picture_list.length < 1) {
    return new Error('请上传轮播图片或视频');
  }
  for (const key in templateFieldRules) {
    const rules = templateFieldRules[key];
    const value = info[key];
    const results = rules.map((rule) => {
      const result = { result: true, message: rule.message, type: rule.type || 'error' };
      if (rule.required && !value) {
        result.result = false;
      }
      if (rule.pattren && !rule.pattren.test(value)) {
        result.result = false;
      }
      if (rule.validator) {
        const valid = rule.validator(value);
        result.result = valid.result || true;
        result.message = valid.message;
      }
      return result;
    });
    const firstFail = results.find((result) => !result.result);
    if (firstFail) {
      return new Error(firstFail.message);
    }
  }
  return request.post('/template/updateTemplate', info).then((res) => res.data);
}

/**
 * 获取模板列表
 * @param {import("../types/Request").RequestParams} params
 * @returns {Promise<import("../types/Request").RequestResponse<import("../types/TemplateInfo").TemplateInfo[]>>|Error}
 */
export function getTemplateList(params) {
  if (!params?.page || !params?.page_size) {
    return new Error('页码和每页数量不能为空');
  }
  return request.post('/template/getTemplateList', params).then((res) => res.data);
}

/**
 * 获取模板详情
 * @param {number} id
 * @returns {Promise<import("../types/Request").RequestResponse<import("../types/TemplateInfo").TemplateInfo>>|Error}
 */
export function getTemplateDetail(id) {
  if (!/^\d$/.test(id + '') || id <= 0) {
    return new Error('未知的模板ID');
  }
  return request.get('/template/getTemplateDetail', { params: { id } }).then((res) => res.data);
}
